import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ProjectStatus, ProjectType, VersionStatus, LoaderType } from '@prisma/client';
import {
  MrpackManifest,
  MrpackManifestFile,
  ProjectCompatibility,
  ProjectCompatibilityLoader,
  MRPACK_FORMAT_VERSION,
} from '@mcp/types';
import archiver from 'archiver';
import type { Response } from 'express';

/** Guard rails for server-pack assembly — keeps one request bounded. */
const SERVER_PACK_MAX_FILES = 200;
const SERVER_PACK_FETCH_TIMEOUT_MS = 30_000;

/** Reduce a Promise rejection reason to a short string for logging. */
function reasonOf(reason: unknown): string {
  if (reason instanceof Error) {
    // AbortError is a DOMException subclass with name 'AbortError' surfaced by
    // fetch-aborts; treat it distinctly so callers see "timeout" not the
    // generic message.
    return (reason as Error & { name?: string }).name === 'AbortError' ? 'timeout' : reason.message;
  }
  return String(reason);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (v: string) => UUID_RE.test(v);

/** Map a loader type onto the `.mrpack` `dependencies` block key, if any. */
const LOADER_DEP_KEY: Partial<Record<LoaderType, string>> = {
  [LoaderType.FABRIC]: 'fabric-loader',
  [LoaderType.FORGE]: 'forge',
  [LoaderType.NEOFORGE]: 'neoforge',
  [LoaderType.QUILT]: 'quilt-loader',
  // BUKKIT/SPIGOT/PAPER/PURPUR are server software, not Modrinth modpack
  // loaders — no standard `.mrpack` dependency key applies.
};

/**
 * Resolve a modpack's `modrinth.index.json` from the stored data.
 *
 * A modpack version's `Dependency` rows reference the included mod projects;
 * the loader rows on that version carry the pack's loader type + game version.
 * At manifest-build time we resolve the latest *approved* version of each
 * required mod that matches the pack's loader + game version, then emit one
 * `files[]` entry per resolved file (sha1 + sha512 + download URL + env).
 */
@Injectable()
export class ModpacksService {
  private readonly logger = new Logger(ModpacksService.name);

  constructor(private prisma: PrismaService) {}

  async buildManifest(projectSlugOrId: string, versionId?: string): Promise<MrpackManifest> {
    // 1. Resolve the (modpack) project.
    const project = await this.prisma.project.findFirst({
      where: isUuid(projectSlugOrId)
        ? { OR: [{ id: projectSlugOrId }, { slug: projectSlugOrId }] }
        : { slug: projectSlugOrId },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        projectType: true,
        clientSide: true,
        serverSide: true,
      },
    });
    if (!project) {
      throw new NotFoundException(`Project "${projectSlugOrId}" not found`);
    }
    if (project.projectType !== ProjectType.MODPACK) {
      throw new BadRequestException(
        `"${project.slug}" is not a modpack — manifests are only available for modpacks`,
      );
    }

    // 2. Resolve the target pack version.
    const packVersion = versionId
      ? await this.prisma.projectVersion.findUnique({
          where: { id: versionId },
          include: { loaders: true, dependencies: { include: { required: true } } },
        })
      : await this.prisma.projectVersion.findFirst({
          where: { projectId: project.id, status: VersionStatus.APPROVED },
          orderBy: { createdAt: 'desc' },
          include: {
            loaders: true,
            dependencies: { include: { required: true } },
          },
        });

    if (!packVersion) {
      throw new NotFoundException(
        versionId
          ? `Version "${versionId}" not found`
          : `No approved versions for "${project.slug}"`,
      );
    }

    // 3. Derive the pack's loader type + game version from its loader rows.
    const packLoaderRows = packVersion.loaders ?? [];
    if (!packLoaderRows.length) {
      throw new BadRequestException(
        `Modpack version "${packVersion.version}" declares no loaders — cannot resolve dependencies`,
      );
    }
    const packLoaderTypes = Array.from(new Set(packLoaderRows.map((l) => l.type)));
    const packGameVersions = Array.from(
      new Set(packLoaderRows.map((l) => l.versionString).filter(Boolean) as string[]),
    );
    // The `.mrpack` dependencies block pins exactly one loader+one game version;
    // if a pack version spans several, take the first (matching Modrinth, which
    // keys a modpack file to a single loader×version pair).
    const packLoaderType = packLoaderTypes[0];
    const packGameVersion = packGameVersions[0];

    // 4. For each required mod project, resolve its latest approved version that
    //    also exposes the pack's loader + game version. Emits a files[] entry.
    const requiredDeps = (packVersion.dependencies ?? []).filter((d) => d.isRequired);
    const files: MrpackManifestFile[] = [];

    for (const dep of requiredDeps) {
      const modProject = dep.required;
      // Self-references or non-existent required projects are skipped silently.
      if (!modProject || modProject.id === project.id) continue;

      const modVersion = await this.prisma.projectVersion.findFirst({
        where: {
          projectId: modProject.id,
          status: VersionStatus.APPROVED,
          loaders: {
            some: {
              type: packLoaderType,
              ...(packGameVersion ? { versionString: packGameVersion } : {}),
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          version: true,
          filename: true,
          fileUrl: true,
          fileSize: true,
          hashSha1: true,
          hashSha512: true,
        },
      });
      if (!modVersion) {
        this.logger.warn(
          `No approved ${packLoaderType}/${packGameVersion ?? 'any'} version of "${modProject.slug}" for pack "${project.slug}" — skipping`,
        );
        continue;
      }
      // The `.mrpack` spec requires sha1 + sha512 per file; skip files that
      // weren't hashed with both at upload time.
      if (!modVersion.hashSha1 || !modVersion.hashSha512) {
        this.logger.warn(
          `"${modProject.slug}" v${modVersion.version} missing sha1/sha512 hashes — skipping (cannot certify .mrpack file entry)`,
        );
        continue;
      }

      const filename = modVersion.filename || `${modProject.slug}_${modVersion.version}.jar`;
      files.push({
        path: `mods/${filename}`,
        hashes: { sha1: modVersion.hashSha1, sha512: modVersion.hashSha512 },
        downloads: [modVersion.fileUrl].filter(Boolean) as string[],
        file_size: modVersion.fileSize,
        env: {
          client: modProject.clientSide ? 'required' : 'unsupported',
          server: modProject.serverSide ? 'required' : 'unsupported',
        },
      });
    }

    // 5. Assemble the dependencies block.
    const dependencies: MrpackManifest['dependencies'] = {};
    if (packGameVersion) dependencies.minecraft = packGameVersion;
    // The loader's own version (e.g. Fabric Loader 0.15.x) isn't stored on the
    // Loader table today — `versionString` holds the *game* version — so the
    // fabric-loader/forge/quilt-loader/neoforge dep can't be pinned honestly.
    // We omit it rather than fabricate a value; launchers fall back to their
    // installed loader. Ingesting the loader version at upload time would let
    // us populate `LOADER_DEP_KEY[packLoaderType]` here.
    void packLoaderType; // referenced in the file-resolution query above

    return {
      format_version: MRPACK_FORMAT_VERSION,
      game: 'minecraft',
      version_id: packVersion.version,
      name: project.title,
      summary: project.description ?? null,
      files,
      dependencies,
    };
  }

  /**
   * Stream a downloadable **server pack** for a modpack: a `.zip` containing
   * `modrinth.index.json`, a pre-resolved `mods/` folder of every server-side
   * mod jar (fetched from the manifest's `files[].downloads[]`), and small
   * `start.sh` / `start.bat` / `README.txt` run-script stubs. This is the
   * Modrinth "server pack generator" feature: download-and-run for a
   * managed server with the mods already resolved.
   *
   * The zip is streamed straight into the Express response (no on-disk temp,
   * no buffering the whole archive in memory). Mod jars are fetched
   * concurrently (capped) with per-file timeouts; any fetch failure is logged
   * and skipped so the archive always finalizes — the manifest is the source
   * of truth, so a missing jar is recoverable by relaunching the pack.
   */
  async streamServerPack(
    projectSlugOrId: string,
    versionId: string | undefined,
    res: Response,
  ): Promise<void> {
    const manifest = await this.buildManifest(projectSlugOrId, versionId);

    // Keep only server-side files (env.server !== 'unsupported'); client-side
    // only mods like Sodium/Reese's Sodium don't belong in a server pack.
    const serverFiles = manifest.files
      .filter((f) => f.env.server !== 'unsupported')
      .slice(0, SERVER_PACK_MAX_FILES);

    const archive = archiver('zip', { zlib: { level: 6 } });
    const archiveName = `${manifest.name.replace(/[^a-z0-9-_]+/gi, '_')}-${manifest.version_id}-server`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${archiveName}.zip"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Surface archiver/writer errors as a 500 mid-stream. Once headers are
    // flushed we can't change the status, so best-effort: log + end.
    archive.on('warning', (err: any) =>
      this.logger.warn(`server-pack archive warning: ${err?.message ?? err}`),
    );
    const onWriterError = (err: Error) => {
      this.logger.error(`server-pack response stream error: ${err.message}`);
      if (!res.headersSent) res.status(500).end();
      else res.end();
    };
    res.on('error', onWriterError);
    archive.on('error', (err: Error) => {
      this.logger.error(`server-pack archive error: ${err.message}`);
      if (!res.headersSent) res.status(500).end();
      else archive.abort();
    });

    archive.pipe(res);

    // 1. The manifest itself — the source of truth for every file.
    archive.append(JSON.stringify(manifest, null, 2), { name: 'modrinth.index.json' });

    // 2. Pre-resolved mods/ folder. Fetch concurrently (capped) so one slow
    //    CDn doesn't stall the rest. Each is appended once its buffer lands.
    let added = 0;
    let skipped = 0;
    const concurrency = 6;
    for (let i = 0; i < serverFiles.length; i += concurrency) {
      const batch = serverFiles.slice(i, i + concurrency);
      const fetched = await Promise.allSettled(
        batch.map((f) => this.fetchWithTimeout(f.downloads[0], SERVER_PACK_FETCH_TIMEOUT_MS)),
      );
      for (let j = 0; j < fetched.length; j++) {
        const outcome = fetched[j];
        if (outcome.status === 'fulfilled') {
          archive.append(outcome.value, { name: batch[j].path });
          added++;
        } else {
          skipped++;
          this.logger.warn(`server-pack: skipping ${batch[j].path} (${reasonOf(outcome.reason)})`);
        }
      }
    }

    // 3. Run-script stubs + README. Not a full EULA-aware launcher — these are
    //    convenience starters; operators still set the server jar + flags.
    const startSh = `#!/usr/bin/env sh
# Generated server pack for ${manifest.name} v${manifest.version_id}
# Place a Minecraft server jar in this directory, accept the EULA
# (eula.txt), then run this script.
exec java -Xms2G -Xmx4G -jar server.jar nogui
`;
    const startBat = `@echo off
REM Generated server pack for ${manifest.name} v${manifest.version_id}
REM Place a server jar here, accept the EULA, then run.
java -Xms2G -Xmx4G -jar server.jar nogui
pause
`;
    const readme = `Server pack: ${manifest.name} v${manifest.version_id}
==================================================

This pack was generated by ${manifest.name}'s server-pack export.

Contents
--------
- modrinth.index.json   Modpack manifest (source of truth)
- mods/                 Pre-resolved server-side mod jars
- start.sh / start.bat  Convenience launchers
- README.txt            This file

Getting started
---------------
1. Download a Minecraft server jar (matching the manifest's Minecraft
   version) into this directory and rename it to server.jar.
2. Run start.sh (Linux/macOS) or start.bat (Windows) once to generate
   eula.txt, then edit eula.txt to accept the Mojang EULA.
3. Run the starter again.

Generation stats
----------------
mods added:                 ${added}
mods skipped (fetch failed): ${skipped}
client-only mods excluded:  ${manifest.files.length - serverFiles.length}
`;
    archive.append(startSh, { name: 'start.sh', mode: 0o755 });
    archive.append(startBat, { name: 'start.bat' });
    archive.append(readme, { name: 'README.txt' });

    this.logger.log(
      `server-pack "${archiveName}": ${added} mods added, ${skipped} skipped, ${manifest.files.length - serverFiles.length} client-only excluded`,
    );

    // finalize() flushes the zip and ends the piped response stream.
    archive.finalize();
  }

  /**
   * Fetch a remote URL into a Buffer with a hard timeout. Returns the bytes
   * or rejects on timeout/non-2xx. Single-attempt — the server-pack flow
   * treats a per-file failure as a skip, not a retry.
   */
  private async fetchWithTimeout(url: string, timeoutMs: number): Promise<Buffer> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const r = await fetch(url, { signal: controller.signal, redirect: 'follow' });
      if (!r.ok || !r.body) {
        throw new Error(`HTTP ${r.status}`);
      }
      return Buffer.from(await r.arrayBuffer());
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Project-level loader × game-version compatibility matrix, derived by
   * aggregating every approved version's `Loader` rows. The existing `Loader`
   * table (type + `versionString`) already encodes this per version, so a
   * read-only matrix needs no extra cache table — this just unions the rows.
   * This is what powers the "Fabric 1.20.1" tag UI.
   */
  async getCompatibility(projectSlugOrId: string): Promise<ProjectCompatibility> {
    const project = await this.prisma.project.findFirst({
      where: isUuid(projectSlugOrId)
        ? { OR: [{ id: projectSlugOrId }, { slug: projectSlugOrId }] }
        : { slug: projectSlugOrId },
      select: { id: true, slug: true },
    });
    if (!project) {
      throw new NotFoundException(`Project "${projectSlugOrId}" not found`);
    }

    const versions = await this.prisma.projectVersion.findMany({
      where: { projectId: project.id, status: VersionStatus.APPROVED },
      select: { loaders: { select: { type: true, versionString: true } } },
    });

    // loader → Set<gameVersion>
    const byLoader = new Map<string, Set<string>>();
    const allGameVersions = new Set<string>();
    for (const v of versions) {
      for (const l of v.loaders) {
        if (!byLoader.has(l.type)) byLoader.set(l.type, new Set());
        if (l.versionString) {
          byLoader.get(l.type)!.add(l.versionString);
          allGameVersions.add(l.versionString);
        }
      }
    }

    const loaders: ProjectCompatibilityLoader[] = [...byLoader.entries()]
      .map(([loader, versions]) => ({
        loader,
        gameVersions: this.sortMcVersions([...versions]),
      }))
      .sort((a, b) => a.loader.localeCompare(b.loader));

    return {
      projectId: project.id,
      slug: project.slug,
      loaders,
      gameVersions: this.sortMcVersions([...allGameVersions]),
    };
  }

  /** Sort Minecraft version strings newest-first, semver-style. */
  private sortMcVersions(versions: string[]): string[] {
    const parse = (v: string) =>
      v
        .replace(/[^\d.]/g, '')
        .split('.')
        .map((n) => parseInt(n, 10) || 0);
    return versions.slice().sort((a, b) => {
      const pa = parse(a);
      const pb = parse(b);
      const len = Math.max(pa.length, pb.length);
      for (let i = 0; i < len; i++) {
        const da = pa[i] ?? 0;
        const db = pb[i] ?? 0;
        if (da !== db) return db - da; // descending
      }
      return 0;
    });
  }

  /**
   * Stream a `.mrpack` archive (Modrinth App / Prism importable): a zip whose
   * root contains `modrinth.index.json` plus an empty `overrides/` folder.
   * Unlike the server-pack, client files are included via the manifest's
   * `files` array — launchers download them directly from their CDN sources,
   * so we do NOT embed the jars (that's what makes mrpack small + legal).
   */
  async streamMrpack(
    projectSlugOrId: string,
    versionId: string | undefined,
    res: Response,
  ): Promise<void> {
    const manifest = await this.buildManifest(projectSlugOrId, versionId);

    const archive = archiver('zip', { zlib: { level: 6 } });
    const safeName = manifest.name.replace(/[^a-z0-9-_]+/gi, '_');
    const archiveName = `${safeName}-${manifest.version_id}.mrpack`;

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${archiveName}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    archive.on('warning', (err: any) =>
      this.logger.warn(`mrpack archive warning: ${err?.message ?? err}`),
    );
    const onWriterError = (err: Error) => {
      this.logger.error(`mrpack response stream error: ${err.message}`);
      if (!res.headersSent) res.status(500).end();
      else res.end();
    };
    res.on('error', onWriterError);
    archive.on('error', (err: Error) => {
      this.logger.error(`mrpack archive error: ${err.message}`);
      if (!res.headersSent) res.status(500).end();
      else archive.abort();
    });

    archive.pipe(res);
    archive.append(JSON.stringify(manifest, null, 2), { name: 'modrinth.index.json' });
    // Launchers require the overrides dir to exist in the zip
    archive.append('', { name: 'overrides/' });
    await archive.finalize();
  }
}

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

interface ManifestFile {
  path: string;
  hashes?: { sha1?: string; sha512?: string };
  env?: { client?: string; server?: string };
  downloads?: string[];
  fileSize?: number;
}

interface Manifest {
  format_version?: number;
  game?: string;
  version_id?: string;
  name?: string;
  summary?: string | null;
  dependencies?: Record<string, string | undefined>;
  files?: ManifestFile[];
}

export interface ImportReport {
  name: string | null;
  versionId: string | null;
  game: string | null;
  minecraft: string | null;
  loader: string | null;
  fileCount: number;
  totalSize: number;
  byFolder: Record<string, { count: number; size: number }>;
  conflicts: ImportConflict[];
  files: ImportFileEntry[];
  notes: string[];
}

export interface ImportFileEntry {
  path: string;
  size: number | null;
  hash: { sha1: string | null; sha512: string | null };
  env: { client: string | null; server: string | null };
  firstDownload: string | null;
  /** Resolved internal project if the first download URL matches a known ProviderProject. */
  resolvedProjectId: string | null;
}

export interface ImportConflict {
  kind:
    | 'MISSING_MINECRAFT'
    | 'UNKNOWN_MINECRAFT'
    | 'MISSING_LOADER'
    | 'UNKNOWN_LOADER'
    | 'TOO_FEW_FILES'
    | 'BAD_FORMAT'
    | 'WRONG_GAME';
  message: string;
}

const VALID_LOADERS = ['minecraft', 'fabric-loader', 'forge', 'quilt-loader', 'neoforge', 'paper'];

@Injectable()
export class ModpackImportService {
  private readonly logger = new Logger(ModpackImportService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Parse + validate a modrinth.index.json manifest and produce an import report.
   * Accepts a JSON string; if the input looks like a ZIP it must be a .mrpack whose
   * manifest is provided separately (we don't unzip in v1 to keep the surface small).
   */
  async inspect(raw: string): Promise<ImportReport> {
    if (!raw || typeof raw !== 'string') {
      throw new BadRequestException('Modpack manifest body is required');
    }
    let manifest: Manifest;
    try {
      manifest = JSON.parse(raw);
    } catch (err: any) {
      throw new BadRequestException(`Invalid JSON: ${err?.message ?? 'parse error'}`);
    }

    const notes: string[] = [];
    if (manifest.game && manifest.game !== 'minecraft') {
      notes.push(`Manifest declares game="${manifest.game}" — only "minecraft" is supported.`);
    }

    const deps = manifest.dependencies ?? {};
    const minecraft = deps.minecraft ?? null;
    const loaderKey = Object.keys(deps).find(
      (k) => k !== 'minecraft' && VALID_LOADERS.includes(k) && Boolean(deps[k]),
    );
    const loader = loaderKey ?? null;

    const conflicts: ImportConflict[] = [];
    if (minecraft) {
      const known = await this.prisma.minecraftVersion.findUnique({
        where: { version: minecraft },
      });
      if (!known) {
        conflicts.push({
          kind: 'UNKNOWN_MINECRAFT',
          message: `Minecraft version "${minecraft}" is not in the catalog.`,
        });
      }
    } else {
      conflicts.push({
        kind: 'MISSING_MINECRAFT',
        message: 'Manifest is missing the `dependencies.minecraft` field.',
      });
    }
    if (loader) {
      // Validate against the catalog of supported loader strings; in v1 we
      // just check that the value is non-empty.
      notes.push(
        `Loader dependency ${loader}@${deps[loaderKey!] ?? '?'} will be required at install.`,
      );
    } else {
      conflicts.push({
        kind: 'MISSING_LOADER',
        message:
          'Manifest is missing a mod loader dependency (fabric-loader, forge, quilt-loader, neoforge or paper).',
      });
    }

    const files = Array.isArray(manifest.files) ? manifest.files : [];
    if (files.length < 1) {
      conflicts.push({ kind: 'TOO_FEW_FILES', message: 'Manifest declares zero files.' });
    }
    if (manifest.format_version !== 1) {
      conflicts.push({
        kind: 'BAD_FORMAT',
        message: `Unsupported format_version: ${manifest.format_version ?? 'missing'}; only Modrinth v1 is supported.`,
      });
    }

    const byFolder: Record<string, { count: number; size: number }> = {};
    let totalSize = 0;
    for (const f of files) {
      const top = (f.path ?? '').split('/')[0] || 'misc';
      if (!byFolder[top]) byFolder[top] = { count: 0, size: 0 };
      byFolder[top].count += 1;
      const size = Number(f.fileSize ?? 0);
      byFolder[top].size += size;
      totalSize += size;
    }

    // Best-effort project resolution: match first download URL against known
    // ProviderProject.externalUrl via the externalId or via a derived CDN host
    // pattern. We index by first download hostname + path. v1 stores nothing
    // for this so the resolvedProjectId will be null in most cases.
    const firstDownloads = files.map((f) => f.downloads?.[0]).filter((u): u is string => !!u);
    const providerMap = await this.loadProviderUrlMap(firstDownloads);

    const fileEntries: ImportFileEntry[] = files.map((f) => {
      const firstDownload = f.downloads?.[0] ?? null;
      const resolved = firstDownload ? (providerMap.get(firstDownload) ?? null) : null;
      return {
        path: f.path,
        size: f.fileSize ?? null,
        hash: { sha1: f.hashes?.sha1 ?? null, sha512: f.hashes?.sha512 ?? null },
        env: { client: f.env?.client ?? null, server: f.env?.server ?? null },
        firstDownload,
        resolvedProjectId: resolved,
      };
    });

    const missing = fileEntries.filter((f) => f.firstDownload && !f.resolvedProjectId);
    if (missing.length) {
      notes.push(
        `${missing.length} file(s) could not be linked to a catalog project — paste the manifest to Modrinth or open an issue to add coverage.`,
      );
    }

    return {
      name: manifest.name ?? null,
      versionId: manifest.version_id ?? null,
      game: manifest.game ?? null,
      minecraft,
      loader: loader ? loaderKey! : null,
      fileCount: files.length,
      totalSize,
      byFolder,
      conflicts,
      files: fileEntries,
      notes,
    };
  }

  private async loadProviderUrlMap(urls: string[]): Promise<Map<string, string>> {
    if (urls.length === 0) return new Map();
    const m = new Map<string, string>();
    try {
      const links = await this.prisma.providerProject.findMany({
        where: { externalUrl: { in: urls } },
        select: { projectId: true, externalUrl: true },
      });
      for (const link of links) {
        if (link.externalUrl) m.set(link.externalUrl, link.projectId);
      }
    } catch (err: any) {
      this.logger.warn(`Provider URL lookup failed: ${err?.message}`);
    }
    return m;
  }

  /**
   * Persist a DRAFT `Project` of type MODPACK from an already-parsed manifest.
   * Used by the admin/import flow: after inspect reports "looks good", the
   * caller can opt-in to create a draft so the manifest's name + version +
   * loader rows are stored and editable in the dashboard.
   *
   * Returns the new project id (and a flag indicating whether key validation
   * surfaced any blocking conflicts — callers can choose to keep or roll back).
   */
  async createDraft(
    raw: string,
    authorId: string,
    opts: { report?: ImportReport; rollbackOnConflicts?: boolean } = {},
  ): Promise<{ project: any; report: ImportReport; rolledBack: boolean }> {
    const report = opts.report ?? (await this.inspect(raw));
    if (opts.rollbackOnConflicts && report.conflicts.length > 0) {
      // Caller didn't want a half-imported project
      return { project: null, report, rolledBack: true };
    }
    if (!report.name) {
      throw new BadRequestException('Manifest is missing a name');
    }
    // Slug from name + versionId
    const baseSlug = report.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);
    const suffix = report.versionId
      ? `-${report.versionId.replace(/[^a-z0-9.]/gi, '').slice(0, 12)}`
      : '';
    const wanted = `${baseSlug}${suffix}`.toLowerCase();
    let slug = wanted || 'modpack';
    // Ensure uniqueness
    for (let i = 1; i < 50; i++) {
      const existing = await this.prisma.project.findUnique({ where: { slug } });
      if (!existing) break;
      slug = `${wanted}-${i}`;
    }

    const minecraftRow = report.minecraft
      ? await this.prisma.minecraftVersion.findUnique({ where: { version: report.minecraft } })
      : null;
    const loaderEnum = report.loader
      ? (report.loader.toUpperCase() as
          'FABRIC' | 'FORGE' | 'NEOFORGE' | 'QUILT' | 'BUKKIT' | 'SPIGOT' | 'PAPER' | 'PURPUR')
      : null;

    const project = await this.prisma.project.create({
      data: {
        title: report.name,
        slug,
        description: report.name,
        body: raw,
        status: 'DRAFT' as any,
        projectType: 'MODPACK' as any,
        authorId,
        clientSide: true,
        serverSide: true,
      },
    });
    if (minecraftRow && loaderEnum) {
      const version = await this.prisma.projectVersion.create({
        data: {
          projectId: project.id,
          version: report.versionId ?? '0.0.0',
          fileUrl: '',
          fileSize: 0,
          hash: '',
          status: 'APPROVED' as any,
        },
      });
      await this.prisma.loader.create({
        data: {
          type: loaderEnum as any,
          versionString: report.minecraft,
          projectId: project.id,
          versionId: version.id,
        },
      });
    }
    return { project, report, rolledBack: false };
  }
}

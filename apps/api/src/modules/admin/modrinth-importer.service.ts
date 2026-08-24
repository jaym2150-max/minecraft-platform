import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { htmlToMarkdown, looksLikeHtml } from './html-to-markdown';

/**
 * One-shot catalog importer from the public Modrinth v2 API
 * (https://docs.modrinth.com). Pulls the most-downloaded projects of each
 * type together with real version histories, download URLs, icons, gallery
 * images and licenses, so the platform boots with genuine working content.
 *
 * Modrinth etiquette: send a descriptive User-Agent and stay under ~300 req/min.
 * We batch where possible and sleep between per-project calls.
 */

const API = 'https://api.modrinth.com/v2';
const UA = 'minecraft-platform/dev (+https://github.com/jaym2150-max/minecraft-platform)';

/** project_type facet → how many top entries to import */
const TYPE_PLAN: Array<{ mrType: string; take: number }> = [
  { mrType: 'mod', take: 20 },
  { mrType: 'modpack', take: 12 },
  { mrType: 'shader', take: 8 },
  { mrType: 'plugin', take: 10 },
  { mrType: 'resourcepack', take: 6 },
  { mrType: 'datapack', take: 6 },
];

/** Modrinth loader slug → our LoaderType enum. Unknown loaders are skipped. */
const LOADER_MAP: Record<string, string> = {
  fabric: 'FABRIC',
  forge: 'FORGE',
  neoforge: 'NEOFORGE',
  quilt: 'QUILT',
  bukkit: 'BUKKIT',
  spigot: 'SPIGOT',
  paper: 'PAPER',
  purpur: 'PURPUR',
};

interface MrHit {
  project_id: string;
  slug: string;
  title: string;
  description: string;
  categories: string[];
  client_side: string;
  server_side: string;
  downloads: number;
  icon_url: string | null;
  author: string;
  date_modified: string;
  license: { id: string; name?: string };
}

interface MrVersion {
  version_number: string;
  changelog: string | null;
  game_versions: string[];
  loaders: string[];
  downloads: number;
  files: Array<{ url: string; filename: string; primary: boolean; size: number; hashes: Record<string, string> }>;
}

@Injectable()
export class ModrinthImportService {
  private readonly logger = new Logger(ModrinthImportService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async api<T>(path: string): Promise<T | null> {
    const res = await fetch(`${API}${path}`, { headers: { 'User-Agent': UA } });
    if (!res.ok) {
      this.logger.warn(`Modrinth ${path} → ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  }

  async sync(limitPerTypeOverride?: number) {
    const startedAt = Date.now();
    const plan = limitPerTypeOverride
      ? TYPE_PLAN.map((p) => ({ ...p, take: Math.min(p.take, limitPerTypeOverride) }))
      : TYPE_PLAN;

    // ensure a default license pool entry for unknowns
    let imported = 0;
    const featuredPool: Array<{ id: string; downloads: number }> = [];

    for (const { mrType, take } of plan) {
      const facets = encodeURIComponent(JSON.stringify([[`project_type:${mrType}`]]));
      const search = await this.api<{ hits: MrHit[] }>(
        `/search?limit=${take}&index=downloads&facets=${facets}`,
      );
      if (!search?.hits?.length) continue;

      for (const hit of search.hits) {
        try {
          await this.importOne(hit);
          imported++;
          featuredPool.push({ id: hit.project_id, downloads: hit.downloads });
          await this.sleep(120); // politeness delay
        } catch (err: any) {
          this.logger.warn(`skip ${hit.slug}: ${err.message}`);
        }
      }
    }

    // Feature the overall top 8 by downloads
    const top = featuredPool.sort((a, b) => b.downloads - a.downloads).slice(0, 8);
    for (const t of top) {
      await this.prisma.project.updateMany({
        where: { id: t.id },
        data: { featured: true },
      });
    }

    const counts = {
      projects: await this.prisma.project.count(),
      versions: await this.prisma.projectVersion.count(),
    };
    return { imported, elapsedMs: Date.now() - startedAt, counts };
  }

  private async importOne(hit: MrHit): Promise<void> {
    const [full, versionsRes, galleryRes] = await Promise.all([
      this.api<any>(`/project/${hit.slug}`),
      this.api<MrVersion[]>(`/project/${hit.slug}/version`),
      this.api<any[]>(`/project/${hit.slug}/gallery`),
    ]);
    if (!full) throw new Error('detail fetch failed');

    // Author user (imported accounts cannot log in — random unusable password)
    const authorUsername = hit.author || `${hit.slug}-team`;
    const author = await this.prisma.user.upsert({
      where: { username: authorUsername },
      update: {},
      create: {
        username: authorUsername,
        displayName: hit.author ?? authorUsername,
        email: `${authorUsername.toLowerCase()}@users.modrinth.imported`,
        passwordHash: '$2a$10$imported.no.login.imported.no.login00000000000000000000000',
        role: 'USER',
        emailVerified: false,
        bio: `Imported Modrinth author.`,
      },
    });

    // License find-or-create
    let licenseId: string | null = null;
    const licId = (full.license?.id ?? '').toUpperCase();
    if (licId && licId !== 'UNKNOWN') {
      const lic = await this.prisma.license.upsert({
        where: { shortId: licId },
        update: {},
        create: { shortId: licId, name: full.license?.name ?? licId, type: 'UNKNOWN' as any, featured: false },
      }).catch(() => null);
      licenseId = lic?.id ?? null;
    }

    // Category match by slug or name (best-effort; nullable in schema)
    const catSlugs = full.categories ?? [];
    let categoryId: string | null = null;
    for (const cSlug of catSlugs.length ? catSlugs : full.display_categories ?? []) {
      const cat = await this.prisma.category.findFirst({
        where: { OR: [{ slug: cSlug }, { name: { equals: cSlug, mode: 'insensitive' } }] },
      });
      if (cat) { categoryId = cat.id; break; }
    }

    // Modrinth serves bodies as HTML — convert to markdown for our renderer.
    const rawBody: string | null =
      typeof full.body === 'string' && full.body.trim().length > 40 ? full.body : null;
    const bodyMd = rawBody
      ? (looksLikeHtml(rawBody) ? htmlToMarkdown(rawBody) : rawBody)
      : null;

    const project = await this.prisma.project.upsert({
      where: { slug: hit.slug },
      update: {
        title: hit.title,
        description: hit.description,
        body: bodyMd ?? undefined,
        iconUrl: hit.icon_url ?? undefined,
        coverUrl: galleryRes?.[0]?.url ?? undefined,
        sourceUrl: full.source_url ?? undefined,
        discordUrl: full.discord_url ?? undefined,
        wikiUrl: full.issues_url ?? undefined,
        downloads: hit.downloads,
        status: 'PUBLISHED' as any,
        projectType: this.mapProjectType(full.project_type) as any,
        licenseId,
        categoryId: categoryId ?? undefined,
      },
      create: {
        slug: hit.slug,
        title: hit.title,
        description: hit.description,
        body: bodyMd,
        iconUrl: hit.icon_url ?? null,
        coverUrl: galleryRes?.[0]?.url ?? null,
        sourceUrl: full.source_url ?? null,
        discordUrl: full.discord_url ?? null,
        wikiUrl: full.issues_url ?? null,
        downloads: hit.downloads,
        views: Math.floor(hit.downloads * 2.4),
        status: 'PUBLISHED' as any,
        projectType: this.mapProjectType(full.project_type) as any,
        authorId: author.id,
        categoryId,
        licenseId,
        clientSide: hit.client_side !== 'unsupported',
        serverSide: hit.server_side !== 'unsupported',
      },
    });

    // Versions: latest 3, primary file only, CLEAN/APPROVED (scanned upstream)
    const vs = (versionsRes ?? []).slice(0, 3);
    for (let i = 0; i < vs.length; i++) {
      const v = vs[i];
      const file = v.files.find((f) => f.primary) ?? v.files[0];
      if (!file) continue;
      const existing = await this.prisma.projectVersion.findUnique({
        where: { projectId_version: { projectId: project.id, version: v.version_number } },
      });
      if (existing) continue;

      const pv = await this.prisma.projectVersion.create({
        data: {
          version: v.version_number.slice(0, 100),
          changelog: v.changelog ?? null,
          fileUrl: file.url,
          filename: file.filename,
          fileSize: file.size,
          hash: file.hashes.sha512 ?? '',
          hashSha512: file.hashes.sha512 ?? null,
          hashSha1: file.hashes.sha1 ?? null,
          downloads: v.downloads,
          status: 'APPROVED' as any,
          scanStatus: 'CLEAN' as any,
          projectId: project.id,
        },
      });

      // Loader × game-version rows power the game-version facet filter.
      const loaders = v.loaders.map((l) => LOADER_MAP[l]).filter(Boolean);
      const gvs = v.game_versions.slice(0, 6);
      for (const l of loaders) {
        for (const gv of gvs) {
          await this.prisma.loader.create({
            data: { type: l as any, versionString: gv, projectId: project.id, versionId: pv.id },
          }).catch(() => {});
        }
      }
      if (loaders.length === 0) {
        // resource/data-pack style: no loader, but keep game-version rows
        for (const gv of gvs) {
          await this.prisma.loader.create({
            data: { type: 'FABRIC' as any, versionString: gv, projectId: project.id, versionId: pv.id },
          }).catch(() => {});
        }
      }
    }

    // Gallery: up to 4 images
    const gallery = (galleryRes ?? []).slice(0, 4);
    const hasGallery = await this.prisma.galleryImage.count({ where: { projectId: project.id } });
    if (!hasGallery && gallery.length) {
      for (let gi = 0; gi < gallery.length; gi++) {
        const g = gallery[gi];
        await this.prisma.galleryImage.create({
          data: {
            type: 'IMAGE' as any,
            url: g.url,
            alt: g.title ?? `${hit.title} screenshot ${gi + 1}`,
            width: 800, height: 450,
            order: gi + 1,
            projectId: project.id,
          },
        }).catch(() => {});
      }
    }
  }

  private mapProjectType(mrType: string): string {
    switch (mrType) {
      case 'modpack': return 'MODPACK';
      case 'resourcepack': return 'RESOURCE_PACK';
      case 'shader': return 'SHADER';
      case 'datapack': return 'DATA_PACK';
      case 'plugin': return 'PLUGIN';
      default: return 'MOD';
    }
  }

  private sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
}

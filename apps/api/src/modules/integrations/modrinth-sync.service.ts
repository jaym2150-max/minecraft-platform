import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LOADER_MAP, ModrinthProvider } from './modrinth.provider';
import { SyncJobsService, SyncCounters, emptyCounters } from './sync-jobs.service';
import type { NormalizedProject, NormalizedVersion, ProviderSearchHit } from './provider.types';

/** project_type facet → how many top entries a FULL_IMPORT seeds. */
const TYPE_PLAN: Array<{ mrType: string; take: number }> = [
  { mrType: 'mod', take: 20 },
  { mrType: 'modpack', take: 12 },
  { mrType: 'shader', take: 8 },
  { mrType: 'plugin', take: 10 },
  { mrType: 'resourcepack', take: 6 },
  { mrType: 'datapack', take: 6 },
];

/** All project types paged during INCREMENTAL sync. */
const INCREMENTAL_TYPES = ['mod', 'modpack', 'shader', 'plugin', 'resourcepack', 'datapack'];

const PAGE_SIZE = 50;
const MAX_PAGES_PER_TYPE = 10;
/** Incremental lookback when no successful run has ever completed. */
const INITIAL_LOOKBACK_DAYS = 30;

/**
 * Modrinth synchronization engine. Every public method runs inside a
 * `provider-sync` BullMQ job and records its progress on a SyncJob row
 * (counters + structured logs), so admins get the spec's
 * "last sync / status / processed / updated / errors" view.
 *
 * Sync modes:
 *  - FULL_IMPORT      top-N per type seeding (boots an empty catalog)
 *  - INCREMENTAL      hourly: page `index=updated` until last-run timestamp
 *  - STATS_REFRESH    daily: batched downloads/metadata refresh for links
 *  - SINGLE_PROJECT   on-demand resync of one project (all versions)
 */
@Injectable()
export class ModrinthSyncService {
  private readonly logger = new Logger(ModrinthSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly provider: ModrinthProvider,
    private readonly syncJobs: SyncJobsService,
    @InjectQueue('virus-scan') private readonly virusScanQueue: Queue,
  ) {}

  /** Idempotent provider row — the platform's single Modrinth registration. */
  getOrInitProvider() {
    return this.prisma.provider.upsert({
      where: { slug: 'modrinth' },
      update: { apiUrl: this.provider.apiUrlPublic },
      create: {
        slug: 'modrinth',
        name: 'Modrinth',
        baseUrl: this.provider.baseUrl,
        apiUrl: this.provider.apiUrlPublic,
        enabled: true,
      },
    });
  }

  // ---- FULL_IMPORT -------------------------------------------------------

  async runFullImport(syncJobId: string, opts: { limitPerType?: number } = {}) {
    const counters = emptyCounters();
    const plan = opts.limitPerType
      ? TYPE_PLAN.map((p) => ({ ...p, take: Math.min(p.take, opts.limitPerType!) }))
      : TYPE_PLAN;
    const featuredPool: Array<{ id: string; downloads: number }> = [];

    for (const { mrType, take } of plan) {
      const hits = await this.provider.searchTop(mrType, take);
      if (!hits.length) {
        await this.syncJobs.log(syncJobId, 'WARN', `No ${mrType} results from Modrinth search`);
        continue;
      }
      await this.syncJobs.log(
        syncJobId,
        'INFO',
        `Full import: ${mrType} (${hits.length} candidates)`,
      );

      for (const hit of hits) {
        try {
          const { projectId, created } = await this.importHit(hit, syncJobId);
          featuredPool.push({ id: projectId, downloads: hit.downloads });
          counters.processed++;
          if (created) counters.created++;
          else counters.updated++;
        } catch (err: any) {
          counters.error++;
          await this.syncJobs.log(
            syncJobId,
            'WARN',
            `Failed to import ${hit.slug}: ${err?.message}`,
          );
        }
        await this.flushCounters(syncJobId, counters);
      }
    }

    // Feature the overall top-8 by downloads (parity with the legacy import).
    const top = featuredPool.sort((a, b) => b.downloads - a.downloads).slice(0, 8);
    if (top.length) {
      await this.prisma.project.updateMany({
        where: { id: { in: top.map((t) => t.id) } },
        data: { featured: true },
      });
    }

    return counters;
  }

  /** Fetch project + versions + gallery and upsert everything for one hit. */
  private async importHit(hit: ProviderSearchHit, syncJobId: string) {
    const [full, versions, gallery] = await Promise.all([
      this.provider.getProject(hit.slug),
      this.provider.getVersions(hit.externalId),
      this.provider.getGallery(hit.externalId),
    ]);
    if (!full) throw new Error('detail fetch failed');

    const { project, created } = await this.upsertProject(full);
    await this.syncVersions(project.id, versions.slice(0, 3), syncJobId);
    await this.ensureGallery(project.id, gallery.slice(0, 4));
    await this.upsertLink(project.id, full);
    return { projectId: project.id, created };
  }

  // ---- INCREMENTAL -------------------------------------------------------

  async runIncremental(syncJobId: string) {
    const counters = emptyCounters();
    const provider = await this.getOrInitProvider();

    const lastRun = await this.syncJobs.lastSuccessfulRun(provider.id, [
      'FULL_IMPORT',
      'INCREMENTAL',
    ]);
    const since = lastRun ?? new Date(Date.now() - INITIAL_LOOKBACK_DAYS * 24 * 3600 * 1000);
    await this.syncJobs.log(
      syncJobId,
      'INFO',
      `Incremental sync since ${since.toISOString()} (${lastRun ? 'last successful run' : `${INITIAL_LOOKBACK_DAYS}d lookback`})`,
    );

    for (const mrType of INCREMENTAL_TYPES) {
      let offset = 0;
      let done = false;
      for (let page = 0; page < MAX_PAGES_PER_TYPE && !done; page++) {
        const result = await this.provider.searchUpdatedSince(mrType, { limit: PAGE_SIZE, offset });
        if (!result.hits.length) break;

        for (const hit of result.hits) {
          const modifiedAt = new Date(hit.dateModified);
          if (!Number.isNaN(modifiedAt.getTime()) && modifiedAt < since) {
            done = true; // ordered by updated desc — everything older is stale
            break;
          }
          try {
            const link = await this.prisma.providerProject.findUnique({
              where: {
                providerId_externalId: { providerId: provider.id, externalId: hit.externalId },
              },
            });
            if (link) {
              await this.refreshLinkedProject(link.projectId, hit, syncJobId);
              counters.updated++;
            } else {
              await this.importHit(hit, syncJobId);
              counters.created++;
            }
          } catch (err: any) {
            counters.error++;
            await this.syncJobs.log(
              syncJobId,
              'WARN',
              `Failed to sync ${hit.slug}: ${err?.message}`,
            );
          }
          counters.processed++;
          await this.flushCounters(syncJobId, counters);
        }
        offset += PAGE_SIZE;
        if (offset >= result.totalHits) break;
      }
    }

    return counters;
  }

  /** Metadata + stats update for an already-linked project. */
  private async refreshLinkedProject(projectId: string, hit: ProviderSearchHit, syncJobId: string) {
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        title: hit.title,
        description: hit.description,
        iconUrl: hit.iconUrl ?? undefined,
        downloads: hit.downloads,
      },
    });

    const row = await this.prisma.providerProject.findFirst({ where: { projectId } });
    if (!row) return;

    const prev = row.externalUpdatedAt ? row.externalUpdatedAt.getTime() : 0;
    const next = new Date(hit.dateModified).getTime();
    if (!Number.isNaN(next) && next > prev) {
      const versions = await this.provider.getVersions(hit.externalId);
      await this.syncVersions(projectId, versions, syncJobId);
    }
    await this.prisma.providerProject.update({
      where: { id: row.id },
      data: {
        lastSyncedAt: new Date(),
        externalSlug: hit.slug,
        externalUpdatedAt: Number.isNaN(next) ? undefined : new Date(next),
      },
    });
  }

  // ---- STATS_REFRESH -----------------------------------------------------

  async runStatsRefresh(syncJobId: string) {
    const counters = emptyCounters();
    const provider = await this.getOrInitProvider();
    const links = await this.prisma.providerProject.findMany({
      where: { providerId: provider.id, status: 'ACTIVE' as any },
      select: { id: true, projectId: true, externalId: true },
    });
    await this.syncJobs.log(
      syncJobId,
      'INFO',
      `Stats refresh over ${links.length} linked projects`,
    );

    for (let i = 0; i < links.length; i += 100) {
      const chunk = links.slice(i, i + 100);
      const projects = await this.provider.getProjectsBatch(chunk.map((l) => l.externalId));
      const byExternalId = new Map(projects.map((p) => [p.externalId, p]));

      for (const linkRow of chunk) {
        const fresh = byExternalId.get(linkRow.externalId);
        counters.processed++;
        if (!fresh) continue;
        try {
          await this.prisma.project.update({
            where: { id: linkRow.projectId },
            data: {
              downloads: fresh.downloads,
              title: fresh.title,
              description: fresh.description,
              iconUrl: fresh.iconUrl ?? undefined,
            },
          });
          await this.prisma.providerProject.update({
            where: { id: linkRow.id },
            data: { lastSyncedAt: new Date(), externalUpdatedAt: new Date(fresh.dateModified) },
          });
          counters.updated++;
        } catch (err: any) {
          counters.error++;
          await this.syncJobs.log(
            syncJobId,
            'WARN',
            `Stats refresh failed for ${linkRow.externalId}: ${err?.message}`,
          );
        }
      }
      await this.flushCounters(syncJobId, counters);
    }

    return counters;
  }

  // ---- SINGLE_PROJECT ------------------------------------------------------

  async runSingleProject(syncJobId: string, projectSlug: string) {
    const counters = emptyCounters();
    const project = await this.prisma.project.findUnique({ where: { slug: projectSlug } });
    if (!project) {
      throw new Error(`Project "${projectSlug}" not found`);
    }
    const link = await this.prisma.providerProject.findFirst({
      where: { projectId: project.id },
      include: { provider: true },
    });
    if (link && link.provider.slug !== 'modrinth') {
      throw new Error(`Project "${projectSlug}" belongs to provider "${link.provider.slug}"`);
    }

    const target = link?.externalSlug ?? project.slug;
    const full = await this.provider.getProject(target);
    if (!full) throw new Error(`Project "${target}" not found on Modrinth`);

    const { created } = await this.upsertProject(full);
    const versions = await this.provider.getVersions(full.externalId);
    await this.syncVersions(project.id, versions, syncJobId);
    const gallery = await this.provider.getGallery(full.externalId);
    await this.ensureGallery(project.id, gallery.slice(0, 8));
    await this.upsertLink(project.id, full);

    counters.processed = 1;
    counters.updated = created ? 0 : 1;
    counters.created = created ? 1 : 0;
    await this.syncJobs.log(syncJobId, 'INFO', `Single-project sync of ${projectSlug} done`);
    return counters;
  }

  // ---- Shared upsert helpers ----------------------------------------------

  private async upsertProject(np: NormalizedProject): Promise<{ project: any; created: boolean }> {
    // Imported author accounts cannot log in (unusable password hash).
    const author = await this.prisma.user.upsert({
      where: { username: np.author.username },
      update: {},
      create: {
        username: np.author.username,
        displayName: np.author.displayName ?? np.author.username,
        email: `${np.author.username.toLowerCase()}@users.modrinth.imported`,
        passwordHash: '$2a$10$imported.no.login.imported.no.login00000000000000000000000',
        role: 'USER',
        emailVerified: false,
        bio: 'Imported Modrinth author.',
      },
    });

    let licenseId: string | null = null;
    if (np.licenseShortId && np.licenseShortId !== 'UNKNOWN') {
      const lic = await this.prisma.license
        .upsert({
          where: { shortId: np.licenseShortId },
          update: {},
          create: {
            shortId: np.licenseShortId,
            name: np.licenseName ?? np.licenseShortId,
            type: 'UNKNOWN' as any,
            featured: false,
          },
        })
        .catch(() => null);
      licenseId = lic?.id ?? null;
    }

    let categoryId: string | null = null;
    for (const cSlug of np.categories) {
      const cat = await this.prisma.category.findFirst({
        where: { OR: [{ slug: cSlug }, { name: { equals: cSlug, mode: 'insensitive' } }] },
      });
      if (cat) {
        categoryId = cat.id;
        break;
      }
    }

    const existing = await this.prisma.project.findUnique({ where: { slug: np.slug } });
    const data = {
      title: np.title,
      description: np.description,
      body: np.body ?? undefined,
      iconUrl: np.iconUrl ?? undefined,
      sourceUrl: np.sourceUrl ?? undefined,
      discordUrl: np.discordUrl ?? undefined,
      wikiUrl: np.wikiUrl ?? undefined,
      downloads: np.downloads,
      status: 'PUBLISHED' as any,
      projectType: np.projectType as any,
      licenseId,
      categoryId: categoryId ?? undefined,
      clientSide: np.clientSide,
      serverSide: np.serverSide,
    };
    const project = existing
      ? await this.prisma.project.update({ where: { id: existing.id }, data })
      : await this.prisma.project.create({
          data: {
            ...data,
            slug: np.slug,
            authorId: author.id,
            categoryId,
          },
        });
    return { project, created: !existing };
  }

  /**
   * Create versions that do not exist yet (matched by externalId, falling
   * back to version number for legacy rows). Imported versions are APPROVED
   * — the admin-triggered sync IS the moderation action for trusted upstream
   * projects — but keep scanStatus PENDING until the virus-scanner worker has
   * actually ClamAV-scanned the remote file. Downloads stay gated on CLEAN.
   */
  private async syncVersions(projectId: string, versions: NormalizedVersion[], syncJobId: string) {
    for (const v of versions) {
      const existing = v.externalId
        ? await this.prisma.projectVersion.findUnique({
            where: { projectId_externalId: { projectId, externalId: v.externalId } },
          })
        : await this.prisma.projectVersion.findUnique({
            where: { projectId_version: { projectId, version: v.versionNumber.slice(0, 100) } },
          });
      if (existing) continue;

      const file = v.files.find((f) => f.primary) ?? v.files[0];
      if (!file) continue;

      const pv = await this.prisma.projectVersion.create({
        data: {
          version: v.versionNumber.slice(0, 100),
          externalId: v.externalId,
          changelog: v.changelog ?? null,
          fileUrl: file.url,
          filename: file.filename,
          fileSize: file.size,
          hash: file.sha512 ?? file.sha1 ?? '',
          hashSha512: file.sha512,
          hashSha1: file.sha1,
          downloads: v.downloads,
          status: 'APPROVED' as any,
          projectId,
        },
      });

      // Real scan: the worker fetches from Modrinth's CDN and flips
      // scanStatus CLEAN/INFECTED. A failure must not abort the sync — the
      // version simply stays PENDING (non-downloadable) and can re-queue.
      try {
        await this.virusScanQueue.add(
          'scan-modrinth',
          {
            uploadId: `modrinth-import:${pv.id}`,
            projectId,
            projectVersionId: pv.id,
            filename: file.filename,
            size: file.size,
            fileUrl: file.url,
            remoteUrl: file.url,
            hash: file.sha512 ?? undefined,
          },
          {
            attempts: 5,
            backoff: { type: 'exponential', delay: 10000 },
            removeOnComplete: { age: 86400 },
            removeOnFail: { age: 604800 },
          },
        );
      } catch (err: any) {
        this.logger.warn(`Failed to enqueue virus scan for version ${pv.id}: ${err?.message}`);
      }

      // Loader × game-version rows power the facet filters.
      const loaders = v.loaders.map((l) => LOADER_MAP[l]).filter(Boolean);
      const gvs = v.gameVersions.slice(0, 6);
      const rows = loaders.length
        ? loaders.flatMap((l) => gvs.map((gv) => ({ type: l, gv })))
        : gvs.map((gv) => ({ type: 'FABRIC', gv })); // loader-less packs keep game-version rows
      for (const r of rows) {
        await this.prisma.loader
          .create({
            data: { type: r.type as any, versionString: r.gv, projectId, versionId: pv.id },
          })
          .catch(() => {});
      }
    }
  }

  private async ensureGallery(
    projectId: string,
    gallery: Array<{ url: string; title: string | null }>,
  ) {
    if (!gallery.length) return;
    const existing = await this.prisma.galleryImage.count({ where: { projectId } });
    if (existing) return;
    for (let i = 0; i < gallery.length; i++) {
      const g = gallery[i];
      await this.prisma.galleryImage
        .create({
          data: {
            type: 'IMAGE' as any,
            url: g.url,
            alt: g.title ?? `Screenshot ${i + 1}`,
            width: 800,
            height: 450,
            order: i + 1,
            projectId,
          },
        })
        .catch(() => {});
    }
  }

  /** Persist the internal↔external link (provider_projects). */
  private async upsertLink(projectId: string, np: NormalizedProject) {
    const provider = await this.getOrInitProvider();
    await this.prisma.providerProject.upsert({
      where: { providerId_externalId: { providerId: provider.id, externalId: np.externalId } },
      update: {
        projectId,
        externalSlug: np.slug,
        externalUrl: np.externalUrl,
        status: 'ACTIVE' as any,
        externalUpdatedAt: np.dateModified ? new Date(np.dateModified) : undefined,
        lastSyncedAt: new Date(),
      },
      create: {
        providerId: provider.id,
        projectId,
        externalId: np.externalId,
        externalSlug: np.slug,
        externalUrl: np.externalUrl,
        status: 'ACTIVE' as any,
        externalUpdatedAt: np.dateModified ? new Date(np.dateModified) : null,
        lastSyncedAt: new Date(),
      },
    });
  }

  /** Flush counters periodically so a crashed run still shows partial progress. */
  private async flushCounters(syncJobId: string, counters: SyncCounters) {
    if ((counters.processed + counters.error) % 5 === 0) {
      await this.syncJobs.setCounters(syncJobId, counters);
    }
  }
}

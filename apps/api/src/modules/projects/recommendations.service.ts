import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ProjectStatus } from '@prisma/client';

export interface RecommendOptions {
  limit?: number;
  /** Project ids to bias toward. First one is the primary seed. */
  seeds?: string[];
}

const CO_DOWNLOAD_WEIGHT = 0.45;
const AUTHOR_WEIGHT = 0.2;
const LOADER_VERSION_WEIGHT = 0.2;
const TAG_WEIGHT = 0.1;
const CATEGORY_WEIGHT = 0.05;
const RECENT_DAYS = 90;
const CO_DOWNLOAD_LIMIT = 1500;
const LOADER_LIMIT = 4;
const MC_VERSION_LIMIT = 4;
const TAG_LIMIT = 6;

/**
 * Hybrid recommendation engine (spec §27).
 *
 *  - Collaborative (co-downloads): for the seed, pull everyone who has
 *    downloaded it (recent), bucket by other project, rank by frequency.
 *  - Content: same author, same loader×Minecraft-version pair, same tags,
 *    same category. The category contribution is intentionally small so a
 *    diverse catalog still surfaces cross-category suggestions.
 *
 * Implementation notes:
 *  - All inputs are in-memory; this scales comfortably up to mid-thousands
 *    of public projects (a few MB of buckets per seed).
 *  - Seeds themselves are excluded from the result even if a self-loop slips
 *    in via dependencies.
 */
@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recommend(opts: RecommendOptions = {}): Promise<any[]> {
    const limit = Math.min(Math.max(opts.limit ?? 12, 1), 50);
    const seeds = Array.from(
      new Set((opts.seeds ?? []).filter((s) => typeof s === 'string' && s.length > 0)),
    );
    if (seeds.length === 0) return [];

    const seedProjects = await this.prisma.project.findMany({
      where: { id: { in: seeds }, status: ProjectStatus.PUBLISHED },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        loaders: { select: { type: true, versionString: true } },
        tags: { select: { tag: { select: { id: true, slug: true } } } },
      },
    });
    if (seedProjects.length === 0) return [];

    const seedIds = new Set(seedProjects.map((p) => p.id));
    const authorIds = new Set(seedProjects.map((p) => p.authorId));
    const categoryIds = new Set(
      seedProjects.map((p) => p.categoryId).filter((c): c is string => !!c),
    );
    const loaderKey = (t: string, gv: string | null) => `${t}::${gv ?? ''}`;
    const loaderKeys = new Set<string>();
    for (const p of seedProjects) {
      for (const l of p.loaders.slice(0, LOADER_LIMIT)) {
        loaderKeys.add(loaderKey(l.type, l.versionString));
      }
    }
    const mcVersions = new Set<string>();
    for (const p of seedProjects) {
      for (const l of p.loaders) {
        if (l.versionString) mcVersions.add(l.versionString);
      }
    }
    const tagIds = new Set<string>();
    for (const p of seedProjects) {
      for (const t of p.tags) tagIds.add(t.tag.id);
    }

    // Co-downloads: find every project downloaded alongside the seeds.
    const since = new Date(Date.now() - RECENT_DAYS * 86400000);
    const coDownloads = new Map<string, number>();
    const downloadRows = await this.prisma.download.findMany({
      where: {
        projectId: { in: Array.from(seedIds) },
        createdAt: { gte: since },
      },
      select: { userId: true, ip: true, projectId: true },
      orderBy: { createdAt: 'desc' },
      take: CO_DOWNLOAD_LIMIT,
    });
    const buckets = new Map<string, Set<string>>();
    for (const d of downloadRows) {
      // Co-bucketing key: same anonymous "user" (logged-in userId or hashed ip).
      const key = d.userId ?? d.ip ?? '';
      if (!key) continue;
      let set = buckets.get(key);
      if (!set) {
        set = new Set<string>();
        buckets.set(key, set);
      }
      set.add(d.projectId);
    }
    for (const set of buckets.values()) {
      if (set.size < 2) continue; // need at least 2 to imply a co-download
      for (const projectId of set) {
        if (seedIds.has(projectId)) continue;
        coDownloads.set(projectId, (coDownloads.get(projectId) ?? 0) + 1);
      }
    }

    // Content candidates: same author OR same category OR same tag OR same
    // loader (broad pool). Same-loader matches alone would otherwise only be
    // discovered via a wider query below; we include loader×version here too
    // so the ranking weights stay meaningful even when the seed has no
    // tags/category/author overlap.
    const ORFilters: any[] = [];
    if (authorIds.size) ORFilters.push({ authorId: { in: Array.from(authorIds) } });
    if (categoryIds.size) ORFilters.push({ categoryId: { in: Array.from(categoryIds) } });
    if (tagIds.size) {
      ORFilters.push({ tags: { some: { tagId: { in: Array.from(tagIds) } } } });
    }
    if (loaderKeys.size) {
      ORFilters.push({
        loaders: {
          some: {
            OR: Array.from(loaderKeys).map((k) => {
              const [t, gv] = k.split('::');
              return { type: t as any, versionString: gv || null };
            }),
          },
        },
      });
    }
    const contentProjects = ORFilters.length
      ? await this.prisma.project.findMany({
          where: {
            OR: ORFilters,
            status: ProjectStatus.PUBLISHED,
            id: { notIn: Array.from(seedIds) },
          },
          include: {
            author: { select: { id: true, username: true, avatarUrl: true } },
            category: { select: { id: true, name: true, slug: true } },
            loaders: { select: { type: true, versionString: true } },
            tags: { include: { tag: true } },
          },
          take: 200,
        })
      : [];

    // Score and assemble the final ranked list.
    const maxCo = Math.max(1, ...Array.from(coDownloads.values()));
    const ranked = new Map<string, { score: number; reason: string[]; project: any }>();
    for (const [projectId, count] of coDownloads.entries()) {
      const norm = (count / maxCo) * CO_DOWNLOAD_WEIGHT;
      ranked.set(projectId, {
        score: norm,
        reason: ['frequently downloaded together'],
        project: null,
      });
    }
    for (const p of contentProjects) {
      const reasons: string[] = [];
      let score = 0;
      if (authorIds.has(p.authorId)) {
        score += AUTHOR_WEIGHT;
        reasons.push('from the same author');
      }
      let loaderHit = false;
      for (const l of p.loaders) {
        if (loaderKeys.has(loaderKey(l.type, l.versionString))) {
          loaderHit = true;
          break;
        }
      }
      if (loaderHit) {
        score += LOADER_VERSION_WEIGHT;
        reasons.push('runs on the same loader and Minecraft version');
      }
      const tagHits = p.tags.reduce(
        (acc: number, t: any) => (tagIds.has(t.tag.id) ? acc + 1 : acc),
        0,
      );
      if (tagHits > 0) {
        const tagScore = Math.min(1, tagHits / 3) * TAG_WEIGHT;
        score += tagScore;
        reasons.push('shared tags');
      }
      if (categoryIds.has(p.categoryId ?? '')) {
        score += CATEGORY_WEIGHT;
        reasons.push('same category');
      }
      if (score <= 0) continue;
      const existing = ranked.get(p.id);
      if (existing) {
        existing.score += score;
        for (const r of reasons) if (!existing.reason.includes(r)) existing.reason.push(r);
        existing.project = existing.project ?? p;
      } else {
        ranked.set(p.id, { score, reason: reasons, project: p });
      }
    }

    // Always surface strong collaborative hits even when not in content pool.
    if (coDownloads.size === 0) {
      // Co-download buckets came back empty (likely no downloads yet) — fall
      // back to a popularity-based mix so the UI still has something to show.
      const fallback = await this.prisma.project.findMany({
        where: { status: ProjectStatus.PUBLISHED, id: { notIn: Array.from(seedIds) } },
        orderBy: { downloads: 'desc' },
        include: {
          author: { select: { id: true, username: true, avatarUrl: true } },
          category: { select: { id: true, name: true, slug: true } },
          loaders: { select: { type: true, versionString: true } },
          tags: { include: { tag: true } },
        },
        take: limit,
      });
      return fallback.map((p) => ({ ...p, recommendationReasons: ['popular on the platform'] }));
    }

    // Hydrate co-download-only entries with full project rows.
    const incompleteIds: string[] = [];
    for (const [id, entry] of ranked.entries()) {
      if (!entry.project) incompleteIds.push(id);
    }
    if (incompleteIds.length) {
      const fullRows = await this.prisma.project.findMany({
        where: { id: { in: incompleteIds } },
        include: {
          author: { select: { id: true, username: true, avatarUrl: true } },
          category: { select: { id: true, name: true, slug: true } },
          loaders: { select: { type: true, versionString: true } },
          tags: { include: { tag: true } },
        },
      });
      for (const row of fullRows) {
        const entry = ranked.get(row.id);
        if (entry) entry.project = row;
      }
    }

    const out = Array.from(ranked.values())
      .filter((r) => !!r.project)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    return out.map((r) => ({
      ...r.project,
      recommendationScore: Number(r.score.toFixed(3)),
      recommendationReasons: r.reason.slice(0, 3),
    }));
  }
}

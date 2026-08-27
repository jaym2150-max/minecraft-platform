import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DataIssueKind, DataIssueStatus, ProjectStatus } from '@prisma/client';

const BROKEN_LINK_TIMEOUT_MS = 6000;
const INACTIVE_THRESHOLD_DAYS = 365;
const TITLE_SIMILARITY_MIN = 0.85;

export interface ScanResult {
  scanned: number;
  byKind: Record<string, number>;
  openIssues: number;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
}

@Injectable()
export class DataQualityService {
  private readonly logger = new Logger(DataQualityService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Public listing ─────────────────────────────────────────────────

  async listIssues(
    opts: { kind?: string; status?: string; projectId?: string; limit?: number } = {},
  ) {
    const where: any = {};
    if (opts.kind) where.kind = opts.kind;
    if (opts.status) where.status = opts.status;
    if (opts.projectId) where.projectId = opts.projectId;
    return this.prisma.dataIssue.findMany({
      where,
      orderBy: [{ severity: 'desc' }, { detectedAt: 'desc' }],
      take: Math.min(opts.limit ?? 100, 500),
      include: { project: { select: { id: true, title: true, slug: true } } },
    });
  }

  async summary() {
    const [open, byKind, bySeverity] = await Promise.all([
      this.prisma.dataIssue.count({ where: { status: 'OPEN' } }),
      this.prisma.dataIssue.groupBy({
        by: ['kind'],
        where: { status: 'OPEN' },
        _count: { _all: true },
      }),
      this.prisma.dataIssue.groupBy({
        by: ['severity'],
        where: { status: 'OPEN' },
        _count: { _all: true },
      }),
    ]);
    return {
      open,
      byKind: Object.fromEntries(byKind.map((row) => [row.kind, row._count._all])),
      bySeverity: Object.fromEntries(
        bySeverity.map((row) => [row.severity.toString(), row._count._all]),
      ),
    };
  }

  async setStatus(id: string, status: 'OPEN' | 'IGNORED' | 'RESOLVED', actorId: string) {
    const issue = await this.prisma.dataIssue.findUnique({ where: { id } });
    if (!issue) throw new BadRequestException(`Issue ${id} not found`);
    return this.prisma.dataIssue.update({
      where: { id },
      data: {
        status: status as DataIssueStatus,
        resolvedAt: status === 'RESOLVED' ? new Date() : null,
        resolvedBy: status === 'RESOLVED' ? actorId : null,
      },
    });
  }

  // ── Duplicates detection (spec §46) ─────────────────────────────────

  async findDuplicates(slug: string) {
    const target = await this.prisma.project.findUnique({
      where: { slug },
      select: { id: true, title: true, slug: true },
    });
    if (!target) return { project: null, candidates: [] as any[] };

    const titleTokens = this.tokenize(target.title);
    const candidates = await this.prisma.project.findMany({
      where: {
        id: { not: target.id },
        status: {
          in: [ProjectStatus.PUBLISHED, ProjectStatus.SUBMITTED, ProjectStatus.DRAFT] as any,
        },
      },
      take: 200,
    });
    const scored = candidates
      .map((c: any) => ({
        project: {
          id: c.id,
          title: c.title,
          slug: c.slug,
          downloads: c.downloads,
          updatedAt: c.updatedAt,
        },
        score: this.titleScore(titleTokens, this.tokenize(c.title)),
        sameSlug: c.slug === target.slug,
        sameExternalId: null as string | null,
      }))
      .filter((r) => r.score >= TITLE_SIMILARITY_MIN || r.sameSlug);

    // cross-link via ProviderProject externalId
    const providerLinks = await this.prisma.providerProject.findMany({
      where: { projectId: { in: scored.map((s) => s.project.id) } },
      select: { projectId: true, externalId: true },
    });
    const targetExternalIds = new Set(
      (
        await this.prisma.providerProject.findMany({
          where: { projectId: target.id },
          select: { externalId: true },
        })
      ).map((p) => p.externalId),
    );
    for (const link of providerLinks) {
      if (targetExternalIds.has(link.externalId)) {
        const match = scored.find((s) => s.project.id === link.projectId);
        if (match) {
          match.sameExternalId = link.externalId;
        }
      }
    }
    scored.sort((a, b) => b.score - a.score);
    return { project: target, candidates: scored.slice(0, 20) };
  }

  // ── Full scan (admin run) ───────────────────────────────────────────

  async runFullScan(): Promise<ScanResult> {
    const startedAt = new Date();
    const all = await this.prisma.project.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        iconUrl: true,
        sourceUrl: true,
        discordUrl: true,
        wikiUrl: true,
        updatedAt: true,
        status: true,
        versions: { select: { id: true } },
        providerProjects: { select: { externalId: true } },
      },
    });

    const byKind: Record<string, number> = {};
    let openIssues = 0;

    for (const p of all) {
      // Duplicates (by title similarity) + DUPLICATE_SLUG / DUPLICATE_EXTERNAL
      const titleTokens = this.tokenize(p.title);
      const peers = await this.prisma.project.findMany({
        where: {
          id: { not: p.id },
          status: {
            in: [ProjectStatus.PUBLISHED, ProjectStatus.SUBMITTED, ProjectStatus.DRAFT] as any,
          },
        },
        take: 200,
      });
      for (const peer of peers) {
        const sim = this.titleScore(titleTokens, this.tokenize(peer.title));
        if (sim >= TITLE_SIMILARITY_MIN) {
          await this.upsertIssue({
            projectId: p.id,
            kind: DataIssueKind.DUPLICATE_TITLE,
            severity: sim >= 0.95 ? 3 : 2,
            detail: `Title similar to "${peer.title}" (${(sim * 100).toFixed(0)}%) — ${peer.slug}`,
            relatedId: peer.id,
          });
          byKind.DUPLICATE_TITLE = (byKind.DUPLICATE_TITLE ?? 0) + 1;
        }
        if (p.slug === peer.slug) {
          await this.upsertIssue({
            projectId: p.id,
            kind: DataIssueKind.DUPLICATE_SLUG,
            severity: 3,
            detail: `Duplicate slug with "${peer.title}" (${peer.id})`,
            relatedId: peer.id,
          });
          byKind.DUPLICATE_SLUG = (byKind.DUPLICATE_SLUG ?? 0) + 1;
        }
      }
      // externalId collision
      for (const my of p.providerProjects) {
        for (const peer of peers) {
          const peersLinks = await this.prisma.providerProject.findMany({
            where: { projectId: peer.id, externalId: my.externalId },
            select: { projectId: true },
          });
          for (const pl of peersLinks) {
            await this.upsertIssue({
              projectId: p.id,
              kind: DataIssueKind.DUPLICATE_EXTERNAL,
              severity: 3,
              detail: `External id ${my.externalId} also linked to ${pl.projectId}`,
              relatedId: pl.projectId,
            });
            byKind.DUPLICATE_EXTERNAL = (byKind.DUPLICATE_EXTERNAL ?? 0) + 1;
          }
        }
      }
      // MISSING_*
      if (!p.description || p.description.trim().length < 20) {
        await this.upsertIssue({
          projectId: p.id,
          kind: DataIssueKind.MISSING_DESCRIPTION,
          severity: 2,
          detail: 'Description is missing or too short (<20 chars).',
        });
        byKind.MISSING_DESCRIPTION = (byKind.MISSING_DESCRIPTION ?? 0) + 1;
      }
      if (!p.iconUrl) {
        await this.upsertIssue({
          projectId: p.id,
          kind: DataIssueKind.MISSING_ICON,
          severity: 1,
          detail: 'No iconUrl set.',
        });
        byKind.MISSING_ICON = (byKind.MISSING_ICON ?? 0) + 1;
      }
      if (p.versions.length === 0) {
        await this.upsertIssue({
          projectId: p.id,
          kind: DataIssueKind.MISSING_VERSIONS,
          severity: 3,
          detail: 'No versions uploaded.',
        });
        byKind.MISSING_VERSIONS = (byKind.MISSING_VERSIONS ?? 0) + 1;
      }
      // INACTIVE_RELEASE_TRAIL: published, no updates in 365d, no version in the last 180d
      if (p.status === ProjectStatus.PUBLISHED) {
        const days = (Date.now() - new Date(p.updatedAt).getTime()) / 86400000;
        if (days > INACTIVE_THRESHOLD_DAYS) {
          await this.upsertIssue({
            projectId: p.id,
            kind: DataIssueKind.INACTIVE_RELEASE_TRAIL,
            severity: 2,
            detail: `No updates in ${Math.floor(days)} days.`,
          });
          byKind.INACTIVE_RELEASE_TRAIL = (byKind.INACTIVE_RELEASE_TRAIL ?? 0) + 1;
        }
      }
      // BROKEN_*_URL: HEAD with short timeout
      const broken: Array<{ kind: DataIssueKind; url: string }> = [];
      for (const [kind, url] of [
        [DataIssueKind.BROKEN_SOURCE_URL, p.sourceUrl],
        [DataIssueKind.BROKEN_DISCORD_URL, p.discordUrl],
        [DataIssueKind.BROKEN_WIKI_URL, p.wikiUrl],
      ] as Array<[DataIssueKind, string | null | undefined]>) {
        if (!url) continue;
        const ok = await this.checkUrl(url);
        if (!ok) broken.push({ kind, url });
      }
      for (const b of broken) {
        await this.upsertIssue({
          projectId: p.id,
          kind: b.kind,
          severity: 2,
          detail: `URL not reachable: ${b.url}`,
        });
        byKind[b.kind] = (byKind[b.kind] ?? 0) + 1;
      }
    }

    openIssues = await this.prisma.dataIssue.count({ where: { status: 'OPEN' } });
    const finishedAt = new Date();
    return {
      scanned: all.length,
      byKind,
      openIssues,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs: finishedAt.getTime() - startedAt.getTime(),
    };
  }

  // ── helpers ───────────────────────────────────────────────────────

  private async upsertIssue(input: {
    projectId: string;
    kind: DataIssueKind;
    severity: number;
    detail: string;
    relatedId?: string | null;
  }): Promise<void> {
    // Dedup: if an OPEN issue with the same (projectId, kind, relatedId) already
    // exists, skip — otherwise we'd churn rows on every scan.
    const existing = await this.prisma.dataIssue.findFirst({
      where: {
        projectId: input.projectId,
        kind: input.kind,
        status: 'OPEN',
        ...(input.relatedId ? { relatedId: input.relatedId } : {}),
      },
      select: { id: true, detail: true },
    });
    if (existing) {
      if (existing.detail !== input.detail) {
        await this.prisma.dataIssue.update({
          where: { id: existing.id },
          data: { detail: input.detail, severity: input.severity },
        });
      }
      return;
    }
    await this.prisma.dataIssue.create({
      data: {
        projectId: input.projectId,
        kind: input.kind,
        severity: input.severity,
        status: 'OPEN',
        detail: input.detail,
        relatedId: input.relatedId ?? null,
      },
    });
  }

  private tokenize(title: string): string[] {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1);
  }

  /** Jaccard similarity on token sets — cheap proxy for "looks like the same mod". */
  private titleScore(a: string[], b: string[]): number {
    if (a.length === 0 && b.length === 0) return 0;
    const setA = new Set(a);
    const setB = new Set(b);
    let inter = 0;
    for (const t of setA) if (setB.has(t)) inter++;
    const union = setA.size + setB.size - inter;
    return union === 0 ? 0 : inter / union;
  }

  private async checkUrl(url: string): Promise<boolean> {
    try {
      const u = new URL(url);
      if (!/^https?:$/.test(u.protocol)) return false;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), BROKEN_LINK_TIMEOUT_MS);
      const res = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'user-agent': 'mcp-data-quality/1.0 (+https://example.test)' },
      });
      clearTimeout(timer);
      // Some CDNs reject HEAD; fall back to GET in those cases.
      if (res.status === 405 || res.status === 403) {
        const controller2 = new AbortController();
        const timer2 = setTimeout(() => controller2.abort(), BROKEN_LINK_TIMEOUT_MS);
        const res2 = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          signal: controller2.signal,
          headers: { 'user-agent': 'mcp-data-quality/1.0 (+https://example.test)' },
        });
        clearTimeout(timer2);
        return res2.status >= 200 && res2.status < 400;
      }
      return res.status >= 200 && res.status < 400;
    } catch {
      return false;
    }
  }
}

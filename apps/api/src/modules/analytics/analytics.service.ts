import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma, ProjectStatus } from '@prisma/client';

type Period = '7d' | '30d' | '90d' | '1y' | 'all';

/** Roles that may read analytics of a project they don't own (moderation view). */
const STAFF_ROLES = new Set(['ADMIN', 'OWNER', 'MODERATOR']);

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  private getStartDate(period: Period): Date | null {
    if (period === 'all') return null;
    const now = new Date();
    const periodDays: Record<Exclude<Period, 'all'>, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    const days = periodDays[period];
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }

  private getPeriodDays(period: Period): number {
    const periodDays: Record<Exclude<Period, 'all'>, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    return period === 'all' ? 365 : periodDays[period];
  }

  /**
   * Project analytics. Authorization is enforced HERE (and not in the
   * controller alone) because the service is the single owner of the
   * "can this user read this project's numbers?" rule and to avoid an
   * accidental future caller re-introducing the IDOR.
   *
   * Returns `null` when the project doesn't exist OR when the requester is
   * neither the owner nor staff AND the project isn't published — the caller
   * surfaces a 403 so the existence of private projects stays hidden.
   */
  async getProjectAnalytics(
    projectId: string,
    period: Period = '30d',
    auth?: { requesterId: string; requesterRole?: string },
  ): Promise<any> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return null;
    }

    if (auth) {
      const isOwner = project.authorId === auth.requesterId;
      const isStaff = !!auth.requesterRole && STAFF_ROLES.has(auth.requesterRole);
      const isPublic = project.status === ProjectStatus.PUBLISHED;
      if (!isOwner && !isStaff && !isPublic) {
        // Non-owner, non-staff requesting analytics of a private project —
        // refuse without distinguishing missing vs forbidden.
        return null;
      }
    }

    const startDate = this.getStartDate(period);

    const [totalDownloads, totalViews, downloadsByDay, viewsByDay, downloadsByVersion, downloadsByLoader, uniqueVisitors] =
      await Promise.all([
        this.prisma.download.count({
          where: {
            projectId,
            ...(startDate ? { createdAt: { gte: startDate } } : {}),
          },
        }),
        project.views,
        this.getDownloadsByDay(projectId, startDate, period),
        this.getViewsByDay(projectId, startDate, period),
        this.getDownloadsByVersion(projectId, startDate),
        this.getDownloadsByLoader(projectId, startDate),
        this.getUniqueVisitors(projectId, startDate),
      ]);

    return {
      projectId,
      period,
      downloads: {
        total: totalDownloads,
        daily: downloadsByDay,
        byVersion: downloadsByVersion,
        byLoader: downloadsByLoader,
      },
      views: {
        total: totalViews,
        daily: viewsByDay,
      },
      uniqueVisitors,
    };
  }

  async getUserAnalytics(userId: string, period: Period = '30d'): Promise<any> {
    const startDate = this.getStartDate(period);

    const userProjects = await this.prisma.project.findMany({
      where: { authorId: userId },
      select: { id: true },
    });
    const userProjectIds = userProjects.map((p) => p.id);

    const [projects, totalDownloads, totalViews, projectsByStatus] = await Promise.all([
      this.prisma.project.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          title: true,
          slug: true,
          downloads: true,
          views: true,
          status: true,
          createdAt: true,
        },
        orderBy: { downloads: 'desc' },
      }),
      this.prisma.download.count({
        where: {
          projectId: { in: userProjectIds },
          ...(startDate ? { createdAt: { gte: startDate } } : {}),
        },
      }),
      this.prisma.project.aggregate({
        where: { authorId: userId },
        _sum: { views: true },
      }),
      this.prisma.project.groupBy({
        by: ['status'],
        where: { authorId: userId },
        _count: { id: true },
      }),
    ]);

    return {
      userId,
      period,
      summary: {
        totalProjects: projects.length,
        totalDownloads,
        totalViews: totalViews._sum.views ?? 0,
        publishedProjects: projectsByStatus.find((s) => s.status === 'PUBLISHED')?._count.id ?? 0,
        draftProjects: projectsByStatus.find((s) => s.status === 'DRAFT')?._count.id ?? 0,
      },
      topProjects: projects.slice(0, 10).map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        downloads: p.downloads,
        views: p.views,
        status: p.status,
      })),
      projectsByStatus: projectsByStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
    };
  }

  async getPlatformAnalytics(period: Period = '30d'): Promise<any> {
    const startDate = this.getStartDate(period);

    const [
      totalUsers,
      totalProjects,
      totalDownloads,
      totalViews,
      activeUsers,
      downloadsTrend,
      newUsers,
      newProjects,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.project.count(),
      this.prisma.download.count(),
      this.prisma.project.aggregate({ _sum: { views: true } }),
      this.prisma.user.count({
        where: { lastLoginAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
      this.getDownloadsTrend(startDate),
      this.prisma.user.count({
        where: { ...(startDate ? { createdAt: { gte: startDate } } : {}) },
      }),
      this.prisma.project.count({
        where: { ...(startDate ? { createdAt: { gte: startDate } } : {}) },
      }),
    ]);

    return {
      period,
      summary: {
        totalUsers,
        totalProjects,
        totalDownloads,
        totalViews: totalViews._sum.views ?? 0,
        activeUsersLast7Days: activeUsers,
        newUsers: newUsers,
        newProjects: newProjects,
      },
      downloadsTrend,
    };
  }

  private async getDownloadsByDay(projectId: string, startDate: Date | null, period: Period): Promise<any[]> {
    const days = this.getPeriodDays(period);
    const result = await this.prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("createdAt") AS date, COUNT(*) AS count
      FROM "Download"
      WHERE "projectId" = ${projectId}
        ${startDate ? Prisma.sql`AND "createdAt" >= ${startDate}` : Prisma.empty}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    return this.fillDayGaps(result, days);
  }

  private async getViewsByDay(projectId: string, startDate: Date | null, period: Period): Promise<any[]> {
    const days = this.getPeriodDays(period);
    const downloadsAsProxy = await this.prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("createdAt") AS date, COUNT(*) AS count
      FROM "Download"
      WHERE "projectId" = ${projectId}
        ${startDate ? Prisma.sql`AND "createdAt" >= ${startDate}` : Prisma.empty}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    return this.fillDayGaps(downloadsAsProxy, days);
  }

  private async getDownloadsByVersion(projectId: string, startDate: Date | null): Promise<any[]> {
    const versions = await this.prisma.projectVersion.findMany({
      where: {
        projectId,
        ...(startDate ? { createdAt: { gte: startDate } } : {}),
      },
      select: { version: true, downloads: true },
    });

    return versions.map((v) => ({
      version: v.version,
      count: v.downloads,
    }));
  }

  private async getDownloadsByLoader(projectId: string, startDate: Date | null): Promise<any[]> {
    const result = await this.prisma.$queryRaw<Array<{ type: string; count: bigint }>>`
      SELECT l.type, COALESCE(SUM(d.count), 0) AS count
      FROM "Loader" l
      LEFT JOIN (
        SELECT "versionId", COUNT(*) AS count
        FROM "Download"
        WHERE "projectId" = ${projectId}
          ${startDate ? Prisma.sql`AND "createdAt" >= ${startDate}` : Prisma.empty}
        GROUP BY "versionId"
      ) d ON d."versionId" = l."versionId"
      WHERE l."projectId" = ${projectId}
      GROUP BY l.type
    `;

    return result.map((r) => ({
      loader: r.type,
      count: Number(r.count),
    }));
  }

  private async getUniqueVisitors(projectId: string, startDate: Date | null): Promise<number> {
    const result = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT COALESCE("userId", "ip")) AS count
      FROM "Download"
      WHERE "projectId" = ${projectId}
        ${startDate ? Prisma.sql`AND "createdAt" >= ${startDate}` : Prisma.empty}
    `;
    return Number(result[0]?.count ?? 0);
  }

  private async getDownloadsTrend(startDate: Date | null): Promise<any[]> {
    const result = await this.prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("createdAt") AS date, COUNT(*) AS count
      FROM "Download"
      ${startDate ? Prisma.sql`WHERE "createdAt" >= ${startDate}` : Prisma.empty}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    return result.map((r) => ({
      date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date),
      count: Number(r.count),
    }));
  }

  private fillDayGaps(data: Array<{ date: Date; count: bigint }>, days: number): any[] {
    const dataMap = new Map<string, number>();
    for (const row of data) {
      const dateStr = row.date instanceof Date ? row.date.toISOString().split('T')[0] : String(row.date);
      dataMap.set(dateStr, Number(row.count));
    }

    const buckets: { date: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      buckets.push({ date: dateStr, count: dataMap.get(dateStr) ?? 0 });
    }

    return buckets;
  }
}

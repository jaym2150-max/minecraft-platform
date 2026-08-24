import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma, ProjectStatus } from '@prisma/client';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async overview() {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [projects, versions, users, downloadsAgg, projectsLast24h] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.projectVersion.count(),
      this.prisma.user.count(),
      this.prisma.project.aggregate({ _sum: { downloads: true } }),
      this.prisma.project.count({
        where: { createdAt: { gte: since24h }, status: ProjectStatus.PUBLISHED },
      }),
    ]);
    return {
      projects,
      versions,
      users,
      downloads: downloadsAgg._sum.downloads ?? 0,
      projectsLast24h,
    };
  }

  async randomProjects(count: number) {
    const take = Math.max(1, Math.min(50, count));
    // Use a tagged-template $queryRaw (parameters go through prepared-statement
    // binding, not string interpolation) so a future caller passing an
    // untrusted `count` can't inject SQL. The clamp above bounds the integer,
    // but the shape change makes the safety explicit and removes a footgun
    // for anyone refactoring this function later.
    const rows = await this.prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "Project"
      WHERE status = ${ProjectStatus.PUBLISHED}::text::"ProjectStatus"
      ORDER BY random()
      LIMIT ${take}
    `;
    if (!rows.length) return [];
    const projects = await this.prisma.project.findMany({
      where: { id: { in: rows.map((r) => r.id) } },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        loaders: { select: { type: true } },
        versions: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { version: true },
        },
      },
    });
    // Preserve randomness ordering (findMany may not return in input order)
    const byId = new Map(projects.map((p) => [p.id, p]));
    return rows.map((r) => byId.get(r.id)).filter(Boolean);
  }
}

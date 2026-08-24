import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UserRole, ProjectStatus, CreatorTier } from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  async listUsers(params: {
    page: number;
    limit: number;
    search?: string;
    role?: UserRole;
    banned?: boolean;
  }) {
    const { page, limit, search, role, banned } = params;
    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;
    if (banned !== undefined) where.banned = banned;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          displayName: true,
          email: true,
          role: true,
          creatorTier: true,
          banned: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { projects: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => ({
        id: u.id,
        username: u.username,
        displayName: u.displayName ?? undefined,
        email: u.email,
        role: u.role,
        creatorTier: u.creatorTier,
        banned: u.banned,
        avatarUrl: u.avatarUrl ?? undefined,
        joined: u.createdAt instanceof Date ? u.createdAt.toISOString().split('T')[0] : u.createdAt,
        projects: u._count.projects,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async changeUserRole(userId: string, role: UserRole, actor: { id: string; role: UserRole }) {
    const RANK: Record<UserRole, number> = {
      USER: 1,
      MODERATOR: 2,
      ADMIN: 3,
      OWNER: 4,
    };

    if (role === UserRole.OWNER && actor.role !== UserRole.OWNER) {
      throw new ForbiddenException('Only owners may grant or remove the OWNER role');
    }

    if (userId === actor.id && RANK[role] < RANK[actor.role]) {
      throw new BadRequestException('You cannot demote yourself');
    }

    if (RANK[role] > RANK[actor.role]) {
      throw new ForbiddenException('Cannot elevate a user above your own role');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.role === UserRole.OWNER && role !== UserRole.OWNER) {
      const ownerCount = await this.prisma.user.count({ where: { role: UserRole.OWNER } });
      if (ownerCount <= 1) {
        throw new ConflictException('Cannot remove the last OWNER of the platform');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        role: true,
        banned: true,
        avatarUrl: true,
      },
    });

    return {
      id: updated.id,
      username: updated.username,
      displayName: updated.displayName ?? undefined,
      email: updated.email,
      role: updated.role,
      banned: updated.banned,
      avatarUrl: updated.avatarUrl ?? undefined,
    };
  }

  async changeUserTier(userId: string, tier: CreatorTier) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { creatorTier: tier },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        role: true,
        creatorTier: true,
        banned: true,
      },
    });

    return {
      id: updated.id,
      username: updated.username,
      displayName: updated.displayName ?? undefined,
      email: updated.email,
      role: updated.role,
      creatorTier: updated.creatorTier,
      banned: updated.banned,
    };
  }

  async banUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { banned: true },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        role: true,
        banned: true,
      },
    });

    try {
      await this.prisma.session.deleteMany({ where: { userId } });
    } catch (err) {
      console.warn(`Failed to revoke sessions for banned user ${userId}:`, err);
    }

    return updated;
  }

  async unbanUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { banned: false },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        role: true,
        banned: true,
      },
    });

    return updated;
  }

  async updateProjectStatus(projectId: string, status: ProjectStatus) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: { status },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    return this.formatProject(updated);
  }

  async updateProjectFeature(projectId: string, featured: boolean) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: { featured },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    return this.formatProject(updated);
  }

  async getAnalytics() {
    const [
      totalUsers,
      totalProjects,
      totalDownloads,
      bannedUsers,
      pendingProjects,
      publishedProjects,
      archivedProjects,
      rejectedProjects,
      pendingReports,
      resolvedReports,
      dismissedReports,
      newUsersToday,
      newProjectsToday,
      downloadsToday,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.project.count(),
      this.prisma.download.count(),
      this.prisma.user.count({ where: { banned: true } }),
      this.prisma.project.count({ where: { status: 'SUBMITTED' } }),
      this.prisma.project.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.project.count({ where: { status: 'ARCHIVED' } }),
      this.prisma.project.count({ where: { status: 'REJECTED' } }),
      this.prisma.report.count({ where: { status: 'PENDING' } }),
      this.prisma.report.count({ where: { status: 'RESOLVED' } }),
      this.prisma.report.count({ where: { status: 'DISMISSED' } }),
      this.prisma.user.count({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),
      this.prisma.project.count({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),
      this.prisma.download.count({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),
    ]);

    return {
      users: { total: totalUsers, banned: bannedUsers },
      projects: {
        total: totalProjects,
        pending: pendingProjects,
        published: publishedProjects,
        archived: archivedProjects,
        rejected: rejectedProjects,
      },
      downloads: { total: totalDownloads, today: downloadsToday },
      reports: {
        pending: pendingReports,
        resolved: resolvedReports,
        dismissed: dismissedReports,
        total: pendingReports + resolvedReports + dismissedReports,
      },
      newUsersToday,
      newProjectsToday,
    };
  }

  private formatProject(project: any): any {
    return {
      id: project.id,
      title: project.title,
      slug: project.slug,
      description: project.description,
      downloads: project.downloads,
      status: project.status,
      featured: project.featured,
      authorId: project.authorId,
      createdAt: project.createdAt instanceof Date ? project.createdAt.toISOString() : project.createdAt,
      updatedAt: project.updatedAt instanceof Date ? project.updatedAt.toISOString() : project.updatedAt,
      author: project.author
        ? {
            id: project.author.id,
            username: project.author.username,
            avatarUrl: project.author.avatarUrl ?? undefined,
          }
        : undefined,
    };
  }
}

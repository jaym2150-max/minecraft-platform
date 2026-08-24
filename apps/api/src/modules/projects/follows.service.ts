import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class FollowsService {
  private readonly logger = new Logger(FollowsService.name);

  constructor(private prisma: PrismaService) {}

  async follow(projectId: string, userId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    await this.prisma.follow.upsert({
      where: { userId_projectId: { userId, projectId } },
      update: {},
      create: { userId, projectId },
    });
  }

  async unfollow(projectId: string, userId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    await this.prisma.follow.deleteMany({
      where: { userId, projectId },
    });
  }

  async isFollowing(projectId: string, userId: string): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    return !!follow;
  }

  async getFollowers(projectId: string, page = 1, limit = 20): Promise<{ data: any[]; meta: any }> {
    const skip = (page - 1) * limit;
    const [follows, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { projectId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
        },
      }),
      this.prisma.follow.count({ where: { projectId } }),
    ]);

    return {
      data: follows.map((f) => ({
        id: f.user.id,
        username: f.user.username,
        avatarUrl: f.user.avatarUrl ?? undefined,
        followedAt: f.createdAt.toISOString(),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getFollowing(userId: string, page = 1, limit = 20): Promise<{ data: any[]; meta: any }> {
    const skip = (page - 1) * limit;
    const [follows, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          project: {
            select: { id: true, title: true, slug: true, iconUrl: true, downloads: true },
          },
        },
      }),
      this.prisma.follow.count({ where: { userId } }),
    ]);

    return {
      data: follows.map((f) => ({
        id: f.project.id,
        title: f.project.title,
        slug: f.project.slug,
        iconUrl: f.project.iconUrl ?? undefined,
        downloads: f.project.downloads,
        followedAt: f.createdAt.toISOString(),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getFollowerCount(projectId: string): Promise<number> {
    return this.prisma.follow.count({ where: { projectId } });
  }

  async notifyFollowers(projectId: string, version: string): Promise<void> {
    const followers = await this.prisma.follow.findMany({
      where: { projectId },
      select: { userId: true },
    });

    if (followers.length === 0) return;

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { title: true, slug: true },
    });
    if (!project) return;

    await this.prisma.notification.createMany({
      data: followers.map((f) => ({
        userId: f.userId,
        type: 'VERSION_RELEASE' as const,
        title: `New version: ${project.title}`,
        body: `Version ${version} has been released for ${project.title}`,
        projectId,
      })),
    });
  }
}

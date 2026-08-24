import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { User } from '@mcp/types';

@Injectable()
export class UserFollowsService {
  private readonly logger = new Logger(UserFollowsService.name);

  constructor(private prisma: PrismaService) {}

  async followUser(followerId: string, followedId: string): Promise<void> {
    // Validate that both users exist
    const [follower, followed] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: followerId } }),
      this.prisma.user.findUnique({ where: { id: followedId } }),
    ]);

    if (!follower) throw new NotFoundException('Follower user not found');
    if (!followed) throw new NotFoundException('User to follow not found');

    // Prevent users from following themselves
    if (followerId === followedId) {
      throw new Error('Users cannot follow themselves');
    }

    await this.prisma.userFollow.upsert({
      where: { followerId_followedId: { followerId, followedId } },
      update: {},
      create: { followerId, followedId },
    });

    // Create a notification for the followed user
    await this.createFollowNotification(followerId, followedId);
  }

  async unfollowUser(followerId: string, followedId: string): Promise<void> {
    // Validate that both users exist
    const [follower, followed] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: followerId } }),
      this.prisma.user.findUnique({ where: { id: followedId } }),
    ]);

    if (!follower) throw new NotFoundException('Follower user not found');
    if (!followed) throw new NotFoundException('User to unfollow not found');

    await this.prisma.userFollow.deleteMany({
      where: { followerId, followedId },
    });
  }

  async isFollowing(followerId: string, followedId: string): Promise<boolean> {
    const follow = await this.prisma.userFollow.findUnique({
      where: { followerId_followedId: { followerId, followedId } },
    });
    return !!follow;
  }

  async getFollowers(userId: string, page = 1, limit = 20): Promise<{ data: any[]; meta: any }> {
    const skip = (page - 1) * limit;
    const [followers, total] = await Promise.all([
      this.prisma.userFollow.findMany({
        where: { followedId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          follower: { select: { id: true, username: true, avatarUrl: true, displayName: true } },
        },
      }),
      this.prisma.userFollow.count({ where: { followedId: userId } }),
    ]);

    return {
      data: followers.map((f) => ({
        id: f.follower.id,
        username: f.follower.username,
        displayName: f.follower.displayName,
        avatarUrl: f.follower.avatarUrl ?? undefined,
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
    const [following, total] = await Promise.all([
      this.prisma.userFollow.findMany({
        where: { followerId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          followed: { select: { id: true, username: true, avatarUrl: true, displayName: true } },
        },
      }),
      this.prisma.userFollow.count({ where: { followerId: userId } }),
    ]);

    return {
      data: following.map((f) => ({
        id: f.followed.id,
        username: f.followed.username,
        displayName: f.followed.displayName,
        avatarUrl: f.followed.avatarUrl ?? undefined,
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

  async getFollowerCount(userId: string): Promise<number> {
    return this.prisma.userFollow.count({ where: { followedId: userId } });
  }

  async getFollowingCount(userId: string): Promise<number> {
    return this.prisma.userFollow.count({ where: { followerId: userId } });
  }

  private async createFollowNotification(followerId: string, followedId: string): Promise<void> {
    const [follower, followed] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: followerId }, select: { username: true, displayName: true } }),
      this.prisma.user.findUnique({ where: { id: followedId }, select: { id: true } }),
    ]);

    if (!follower || !followed) return;

    await this.prisma.notification.create({
      data: {
        userId: followedId,
        type: 'FOLLOW' as const,
        title: 'New follower',
        body: `${follower.displayName || follower.username} started following you`,
        // No projectId since this is a user-to-user notification
      },
    });
  }
}
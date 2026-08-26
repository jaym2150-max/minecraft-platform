import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ScopesGuard } from '../../common/guards/scopes.guard';
import { Scopes } from '../../common/decorators/scopes.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { FollowsService } from '../projects/follows.service';
import { ProjectsService } from '../projects/projects.service';
import { VersionsService } from '../versions/versions.service';
import { ReviewsService } from '../reviews/reviews.service';
import { CommentsService } from '../comments/comments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiKeyScope } from '@prisma/client';
import { IsArray, IsString, ArrayMaxSize } from 'class-validator';
import { UserFollowsService } from './user-follows.service';

class BatchUsersDto {
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  ids!: string[];
}

class FollowUserDto {
  @IsString()
  userId!: string;
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly followsService: FollowsService,
    private readonly userFollowsService: UserFollowsService,
    private readonly projectsService: ProjectsService,
    private readonly versionsService: VersionsService,
    private readonly reviewsService: ReviewsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  async list(@Query('ids') ids?: string) {
    if (!ids) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Query parameter "ids" is required (comma-separated)',
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
    const parsed = ids
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    // Cap the batch to match the POST /users/batch limit. Without this,
    // a caller could pass ?ids=u1,u2,...,u10000 and force a single Prisma
    // `findMany({ where: { id: { in: [...] } } })` over thousands of ids,
    // making the endpoint a public account-enumeration + DoS vector.
    const MAX_USER_BATCH = 200;
    if (parsed.length > MAX_USER_BATCH) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Too many ids; max is ${MAX_USER_BATCH}. Use POST /users/batch for larger sets.`,
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
    const users = await this.prisma.user.findMany({
      where: { id: { in: parsed } },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        role: true,
        createdAt: true,
      },
    });
    const data = users.map((u) => this.usersService.toPublicProfile(u as any));
    return {
      statusCode: HttpStatus.OK,
      message: 'Users retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('batch')
  @HttpCode(HttpStatus.OK)
  async batch(@Body() dto: BatchUsersDto) {
    const users = await this.prisma.user.findMany({
      where: { id: { in: dto.ids } },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        role: true,
        createdAt: true,
      },
    });
    const data = users.map((u) => this.usersService.toPublicProfile(u as any));
    return {
      statusCode: HttpStatus.OK,
      message: 'Users retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: any) {
    const { passwordHash, ...safeUser } = user;
    return {
      statusCode: HttpStatus.OK,
      message: 'User retrieved successfully',
      data: safeUser,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('me/sessions')
  @UseGuards(JwtAuthGuard)
  async getSessions(@CurrentUser('id') userId: string) {
    const sessions = await this.prisma.session.findMany({
      where: { userId, expiresAt: { gte: new Date() } },
      orderBy: { lastActiveAt: 'desc' },
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Sessions retrieved successfully',
      data: sessions,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('me/following')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getFollowing(
    @CurrentUser('id') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const { data, meta } = await this.followsService.getFollowing(
      userId,
      Number(page),
      Number(limit),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Following list retrieved successfully',
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('me/followers')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getFollowers(
    @CurrentUser('id') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const { data, meta } = await this.followsService.getFollowers(
      userId,
      Number(page),
      Number(limit),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Followers list retrieved successfully',
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('me/user-following')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUserFollowing(
    @CurrentUser('id') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const { data, meta } = await this.userFollowsService.getFollowing(
      userId,
      Number(page),
      Number(limit),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'User following list retrieved successfully',
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('me/user-followers')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUserFollowers(
    @CurrentUser('id') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const { data, meta } = await this.userFollowsService.getFollowers(
      userId,
      Number(page),
      Number(limit),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'User followers list retrieved successfully',
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('me/following/activity')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getFollowingActivity(
    @CurrentUser('id') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    // Get the list of users that the current user follows
    const { data: followingUsers } = await this.userFollowsService.getFollowing(
      userId,
      1, // Get all followed users (we'll handle pagination differently for activities)
      1000, // Reasonable limit for number of users one can follow
    );

    const followedUserIds = followingUsers.map((user) => user.id);

    // If user isn't following anyone, return empty activity feed
    if (followedUserIds.length === 0) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Following activity retrieved successfully',
        data: [],
        meta: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Fetch all activities from followed users
    const [projects, versions, reviews, comments] = await Promise.all([
      // Get projects created by followed users
      this.prisma.project.findMany({
        where: {
          authorId: { in: followedUserIds },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      }),

      // Get versions published by followed users (through their projects)
      this.prisma.projectVersion.findMany({
        where: {
          project: {
            authorId: { in: followedUserIds },
          },
          status: 'APPROVED', // Only show approved/public versions
        },
        select: {
          id: true,
          version: true,
          createdAt: true,
          project: {
            select: {
              id: true,
              title: true,
              slug: true,
              author: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      }),

      // Get reviews written by followed users
      this.prisma.review.findMany({
        where: {
          userId: { in: followedUserIds },
        },
        select: {
          id: true,
          rating: true,
          title: true,
          body: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          project: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      }),

      // Get comments made by followed users
      this.prisma.comment.findMany({
        where: {
          authorId: { in: followedUserIds },
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          project: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      }),
    ]);

    // Helper function to get display name (fallback to username)
    const getDisplayName = (username: string, displayName: string | undefined) =>
      displayName || username;

    // Convert to activity items
    const activityItems: any[] = [];

    // Process projects (creation)
    projects.forEach((project) => {
      activityItems.push({
        id: `project_${project.id}`,
        type: 'create',
        userId: project.author.id,
        username: project.author.username,
        displayName: project.author.displayName,
        avatarUrl: project.author.avatarUrl,
        projectId: project.id,
        projectTitle: project.title,
        projectSlug: project.slug,
        description: `created a new project: ${project.title}`,
        createdAt: project.createdAt,
      });
    });

    // Process versions (releases)
    versions.forEach((version) => {
      activityItems.push({
        id: `version_${version.id}`,
        type: 'release',
        userId: version.project.author.id,
        username: version.project.author.username,
        displayName: version.project.author.displayName,
        avatarUrl: version.project.author.avatarUrl,
        projectId: version.project.id,
        projectTitle: version.project.title,
        projectSlug: version.project.slug,
        versionNumber: version.version,
        description: `released version ${version.version} of ${version.project.title}`,
        createdAt: version.createdAt,
      });
    });

    // Process reviews
    reviews.forEach((review) => {
      activityItems.push({
        id: `review_${review.id}`,
        type: 'review',
        userId: review.user.id,
        username: review.user.username,
        displayName: review.user.displayName,
        avatarUrl: review.user.avatarUrl,
        projectId: review.project.id,
        projectTitle: review.project.title,
        projectSlug: review.project.slug,
        rating: review.rating,
        description: `reviewed ${review.project.title} with ${review.rating}/5 stars`,
        createdAt: review.createdAt,
      });
    });

    // Process comments
    comments.forEach((comment) => {
      activityItems.push({
        id: `comment_${comment.id}`,
        type: 'comment',
        userId: comment.author.id,
        username: comment.author.username,
        displayName: comment.author.displayName,
        avatarUrl: comment.author.avatarUrl,
        projectId: comment.project.id,
        projectTitle: comment.project.title,
        projectSlug: comment.project.slug,
        description:
          comment.content.length > 100 ? comment.content.substring(0, 97) + '...' : comment.content,
        createdAt: comment.createdAt,
      });
    });

    // Sort all activities by date (most recent first)
    activityItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Get total count for pagination
    const total = activityItems.length;

    // Apply pagination
    const paginatedActivities = activityItems.slice(skip, skip + limit);

    // Format for frontend
    const formattedActivities = paginatedActivities.map((activity) => ({
      id: activity.id,
      type: activity.type,
      description: `${getDisplayName(activity.username, activity.displayName)} ${activity.description}`,
      // For compatibility with potential frontend components, include timestamp
      createdAt: new Date(activity.createdAt).toISOString(),
      // Additional metadata for richer UI if needed
      metadata: {
        user: {
          id: activity.userId,
          username: activity.username,
          displayName: activity.displayName,
          avatarUrl: activity.avatarUrl,
        },
        project: {
          id: activity.projectId,
          title: activity.projectTitle,
          slug: activity.projectSlug,
        },
        ...(activity.type === 'release' && { version: activity.versionNumber }),
        ...(activity.type === 'review' && { rating: activity.rating }),
      },
    }));

    return {
      statusCode: HttpStatus.OK,
      message: 'Following activity retrieved successfully',
      data: formattedActivities,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('me/follow')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async followUser(@CurrentUser('id') followerId: string, @Body() dto: FollowUserDto) {
    await this.userFollowsService.followUser(followerId, dto.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'User followed successfully',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('me/unfollow/:userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async unfollowUser(@CurrentUser('id') followerId: string, @Param('userId') followedId: string) {
    await this.userFollowsService.unfollowUser(followerId, followedId);
    return {
      statusCode: HttpStatus.OK,
      message: 'User unfollowed successfully',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('me/notification-preferences')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async saveNotificationPreferences(
    @CurrentUser('id') userId: string,
    @Body() body: { preferences: Record<string, boolean> },
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Notification preferences saved',
      data: body.preferences,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('me/delete')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@CurrentUser('id') userId: string, @Body() body: { password: string }) {
    if (!body.password) {
      throw new BadRequestException('Password is required to delete account');
    }

    // Re-verify the password against the stored hash fetched explicitly,
    // rather than relying on a hash carried on req.user (which we no longer
    // surface — see UsersService.formatUser).
    const storedHash = await this.usersService.getPasswordHash(userId);
    const isValid = storedHash
      ? await this.usersService.comparePassword(body.password, storedHash)
      : false;
    if (!isValid) {
      throw new UnauthorizedException('Password is incorrect');
    }

    // Hard-delete the user and all dependent records in a single transaction.
    // Previously this re-assigned orphaned comments to a non-existent
    // "DELETED_USER_ID" placeholder that had no User row — a guaranteed FK
    // violation that crashed deletion for anyone who had ever commented.
    //
    // Relations without an onDelete rule that reference users:
    //   - Comment.authorId     -> user's own comments are deleted
    //   - Report.reporterId    -> reports they filed are deleted
    //   - Report.reportedId    -> reports against them are nullified
    //   - Project.authorId     -> their projects (and cascades) are deleted
    // Session/TwoFactor/Notification/PasswordResetToken already cascade.
    await this.prisma.$transaction(async (tx) => {
      // 1. Re-parent or remove the user's comments. Replies to the user's
      //    comments reference them via parentId, so detach those first, then
      //    delete the user's own comments.
      const userCommentIds = await tx.comment.findMany({
        where: { authorId: userId },
        select: { id: true },
      });
      if (userCommentIds.length) {
        // Detach any replies pointing at the user's comments.
        await tx.comment.updateMany({
          where: { parentId: { in: userCommentIds.map((c) => c.id) } },
          data: { parentId: null },
        });
        await tx.comment.deleteMany({ where: { authorId: userId } });
      }

      // 2. Reports: delete ones they filed and ones filed against them.
      //    reportedId/reporterId are non-nullable FKs, so we remove the
      //    report rows rather than attempting to null out the references.
      await tx.report.deleteMany({
        where: { OR: [{ reporterId: userId }, { reportedId: userId }] },
      });

      // 3. Projects owned by the user: delete their versions, loaders,
      //    dependencies, comments, team, downloads, then the project.
      const userProjects = await tx.project.findMany({
        where: { authorId: userId },
        select: { id: true },
      });
      if (userProjects.length) {
        const projectIds = userProjects.map((p) => p.id);
        await tx.loader.deleteMany({ where: { projectId: { in: projectIds } } });
        await tx.dependency.deleteMany({
          where: { OR: [{ dependentId: { in: projectIds } }, { requiredId: { in: projectIds } }] },
        });
        await tx.projectVersion.deleteMany({ where: { projectId: { in: projectIds } } });
        await tx.comment.deleteMany({ where: { projectId: { in: projectIds } } });
        await tx.teamMember.deleteMany({ where: { projectId: { in: projectIds } } });
        await tx.team.deleteMany({ where: { projectId: { in: projectIds } } });
        await tx.download.deleteMany({ where: { projectId: { in: projectIds } } });
        await tx.project.deleteMany({ where: { id: { in: projectIds } } });
      }

      // 4. Team memberships.
      await tx.teamMember.deleteMany({ where: { userId } });

      // 5. Finally the user record. Cascading relations (Session,
      //    TwoFactorSecret, Notification, PasswordResetToken) follow.
      await tx.user.delete({ where: { id: userId } });
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Account deleted successfully',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('me/sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async revokeSession(@CurrentUser('id') userId: string, @Param('sessionId') sessionId: string) {
    await this.prisma.session.deleteMany({
      where: { id: sessionId, userId },
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Session revoked successfully',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('me/sessions/revoke-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async revokeAllOtherSessions(
    @CurrentUser('id') userId: string,
    @Body() body: { currentSessionId?: string },
  ) {
    const where: any = { userId };
    if (body.currentSessionId) {
      where.id = { not: body.currentSessionId };
    }
    await this.prisma.session.deleteMany({ where });
    return {
      statusCode: HttpStatus.OK,
      message: 'All other sessions revoked',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':username')
  @Public()
  async findByUsername(@Param('username') username: string) {
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      throw new NotFoundException(`User "${username}" not found`);
    }
    // Public, unauthenticated endpoint: return only a safe profile with no
    // email, emailVerified flag, or timestamps (see toPublicProfile).
    return {
      statusCode: HttpStatus.OK,
      message: 'User retrieved successfully',
      data: this.usersService.toPublicProfile(user),
      timestamp: new Date().toISOString(),
    };
  }
}

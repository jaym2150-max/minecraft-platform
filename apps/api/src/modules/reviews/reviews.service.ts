import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateReviewDto, userId: string): Promise<any> {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const existing = await this.prisma.review.findUnique({
      where: { userId_projectId: { userId, projectId: dto.projectId } },
    });
    if (existing) {
      throw new BadRequestException('You have already reviewed this project');
    }

    const review = await this.prisma.review.create({
      data: {
        rating: dto.rating,
        title: dto.title,
        body: dto.body,
        userId,
        projectId: dto.projectId,
      },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    await this.updateProjectRating(dto.projectId);

    return this.format(review);
  }

  async findByProject(projectId: string, page = 1, limit = 20): Promise<any> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
        },
      }),
      this.prisma.review.count({ where: { projectId } }),
    ]);

    const stats = await this.getProjectStats(projectId);

    return {
      data: reviews.map((r) => this.format(r)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        stats,
      },
    };
  }

  async findOne(id: string): Promise<any> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return this.format(review);
  }

  async findUserReview(projectId: string, userId: string): Promise<any> {
    const review = await this.prisma.review.findUnique({
      where: { userId_projectId: { userId, projectId } },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
    });
    return review ? this.format(review) : null;
  }

  async update(id: string, dto: UpdateReviewDto, userId: string, userRole: string): Promise<any> {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    if (review.userId !== userId && userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
      throw new ForbiddenException('You are not allowed to update this review');
    }

    const updated = await this.prisma.review.update({
      where: { id },
      data: {
        rating: dto.rating,
        title: dto.title,
        body: dto.body,
      },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    await this.updateProjectRating(review.projectId);

    return this.format(updated);
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    if (review.userId !== userId && userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
      throw new ForbiddenException('You are not allowed to delete this review');
    }

    await this.prisma.review.delete({ where: { id } });
    await this.updateProjectRating(review.projectId);
  }

  async getProjectStats(projectId: string): Promise<{ average: number; count: number; distribution: Record<number, number> }> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { ratingAverage: true, ratingCount: true },
    });

    const ratings = await this.prisma.review.findMany({
      where: { projectId },
      select: { rating: true },
    });

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of ratings) {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    }

    return {
      average: project?.ratingAverage ?? 0,
      count: project?.ratingCount ?? 0,
      distribution,
    };
  }

  private async updateProjectRating(projectId: string): Promise<void> {
    const result = await this.prisma.review.aggregate({
      where: { projectId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        ratingAverage: result._avg.rating ?? 0,
        ratingCount: result._count.rating,
      },
    });
  }

  private format(review: any): any {
    return {
      id: review.id,
      rating: review.rating,
      title: review.title ?? undefined,
      body: review.body ?? undefined,
      userId: review.userId,
      projectId: review.projectId,
      createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : review.createdAt,
      updatedAt: review.updatedAt instanceof Date ? review.updatedAt.toISOString() : review.updatedAt,
      user: review.user
        ? {
            id: review.user.id,
            username: review.user.username,
            avatarUrl: review.user.avatarUrl ?? undefined,
          }
        : undefined,
    };
  }
}

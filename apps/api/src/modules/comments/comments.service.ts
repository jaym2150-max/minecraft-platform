import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCommentDto, authorId: string): Promise<any> {
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) {
      throw new NotFoundException(`Project with id "${dto.projectId}" not found`);
    }

    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({ where: { id: dto.parentId } });
      if (!parent) {
        throw new NotFoundException(`Parent comment with id "${dto.parentId}" not found`);
      }
      if (parent.projectId !== dto.projectId) {
        throw new ForbiddenException('Parent comment does not belong to this project');
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: dto.content,
        authorId,
        projectId: dto.projectId,
        parentId: dto.parentId,
      },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true, role: true } },
      },
    });

    return this.format(comment);
  }

  async findByProject(projectId: string, page = 1, limit = 20): Promise<any> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project with id "${projectId}" not found`);
    }

    const skip = (page - 1) * limit;
    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { projectId, parentId: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, username: true, avatarUrl: true, role: true } },
          replies: {
            include: {
              author: { select: { id: true, username: true, avatarUrl: true, role: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      this.prisma.comment.count({ where: { projectId, parentId: null } }),
    ]);

    return {
      data: comments.map((c) => this.format(c)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<any> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true, role: true } },
        replies: {
          include: {
            author: { select: { id: true, username: true, avatarUrl: true, role: true } },
          },
        },
      },
    });
    if (!comment) {
      throw new NotFoundException(`Comment with id "${id}" not found`);
    }
    return this.format(comment);
  }

  async update(id: string, dto: UpdateCommentDto, userId: string, userRole: string): Promise<any> {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Comment with id "${id}" not found`);
    }

    if (comment.authorId !== userId && !['MODERATOR', 'ADMIN', 'OWNER'].includes(userRole?.toUpperCase())) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    const updated = await this.prisma.comment.update({
      where: { id },
      data: { content: dto.content },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true, role: true } },
      },
    });

    return this.format(updated);
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Comment with id "${id}" not found`);
    }

    if (comment.authorId !== userId && !['MODERATOR', 'ADMIN', 'OWNER'].includes(userRole?.toUpperCase())) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.$transaction([
      this.prisma.comment.deleteMany({ where: { parentId: id } }),
      this.prisma.comment.delete({ where: { id } }),
    ]);
  }

  private format(comment: any): any {
    return {
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      projectId: comment.projectId,
      parentId: comment.parentId ?? undefined,
      createdAt:
        comment.createdAt instanceof Date ? comment.createdAt.toISOString() : comment.createdAt,
      updatedAt:
        comment.updatedAt instanceof Date ? comment.updatedAt.toISOString() : comment.updatedAt,
      author: comment.author
        ? {
            id: comment.author.id,
            username: comment.author.username,
            avatarUrl: comment.author.avatarUrl ?? undefined,
            role: comment.author.role,
          }
        : undefined,
      replies: comment.replies?.map((r: any) => this.format(r)) ?? [],
    };
  }
}

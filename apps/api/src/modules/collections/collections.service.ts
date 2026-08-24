import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { paginateCursor, CursorPage } from '../../common/pagination';

@Injectable()
export class CollectionsService {
  private readonly logger = new Logger(CollectionsService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateCollectionDto) {
    const collection = await this.prisma.collection.create({
      data: {
        name: dto.name,
        description: dto.description,
        iconUrl: dto.iconUrl,
        isPublic: dto.isPublic ?? true,
        userId,
      },
    });
    return this.format(collection);
  }

  async findAll(query: { userId?: string; isPublic?: boolean; page?: number; limit?: number }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: any = {};
    if (query.userId) where.userId = query.userId;
    if (query.isPublic !== undefined) where.isPublic = query.isPublic;

    const [data, total] = await Promise.all([
      this.prisma.collection.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
          _count: { select: { projects: true } },
        },
      }),
      this.prisma.collection.count({ where }),
    ]);

    return {
      data: data.map((c) => ({ ...this.format(c), projectCount: c._count.projects })),
      meta: { total, page, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAllCursor(
    query: { userId?: string; isPublic?: boolean; cursor?: string; limit?: number } = {},
  ): Promise<CursorPage<any>> {
    const where: any = {};
    if (query.userId) where.userId = query.userId;
    if (query.isPublic !== undefined) where.isPublic = query.isPublic;

    return paginateCursor<any>({
      take: query.limit ?? 20,
      cursor: query.cursor,
      where,
      orderBy: { createdAt: 'desc' },
      prismaDelegate: {
        findMany: (args) => this.prisma.collection.findMany({
          ...(args as any),
          include: {
            user: { select: { id: true, username: true, avatarUrl: true } },
            _count: { select: { projects: true } },
          },
        }),
      },
    }).then((page) => ({
      ...page,
      data: page.data.map((c) => ({
        ...this.format(c),
        projectCount: c._count.projects,
      })),
    }));
  }

  async findOne(id: string, currentUserId?: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        projects: {
          orderBy: { sortOrder: 'asc' },
          include: {
            project: {
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                iconUrl: true,
                downloads: true,
                author: { select: { username: true } },
              },
            },
          },
        },
        _count: { select: { projects: true } },
      },
    });

    if (!collection) throw new NotFoundException('Collection not found');
    if (!collection.isPublic && collection.userId !== currentUserId) {
      throw new NotFoundException('Collection not found');
    }

    return {
      ...this.format(collection),
      projectCount: collection._count.projects,
      projects: collection.projects.map((cp) => ({
        id: cp.id,
        notes: cp.notes,
        sortOrder: cp.sortOrder,
        addedAt: cp.createdAt.toISOString(),
        project: cp.project,
      })),
    };
  }

  async update(id: string, userId: string, dto: UpdateCollectionDto) {
    const collection = await this.findOwned(id, userId);
    const updated = await this.prisma.collection.update({
      where: { id },
      data: dto,
    });
    return this.format(updated);
  }

  async remove(id: string, userId: string) {
    await this.findOwned(id, userId);
    await this.prisma.collection.delete({ where: { id } });
    return { message: 'Collection deleted' };
  }

  async addProject(id: string, userId: string, projectId: string, notes?: string) {
    await this.findOwned(id, userId);

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const maxOrder = await this.prisma.collectionProject.aggregate({
      where: { collectionId: id },
      _max: { sortOrder: true },
    });

    const entry = await this.prisma.collectionProject.create({
      data: {
        collectionId: id,
        projectId,
        notes,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
      include: {
        project: { select: { id: true, title: true, slug: true, iconUrl: true } },
      },
    });

    return entry;
  }

  async removeProject(id: string, userId: string, projectId: string) {
    await this.findOwned(id, userId);

    await this.prisma.collectionProject.deleteMany({
      where: { collectionId: id, projectId },
    });

    return { message: 'Project removed from collection' };
  }

  private async findOwned(id: string, userId: string) {
    const collection = await this.prisma.collection.findUnique({ where: { id } });
    if (!collection) throw new NotFoundException('Collection not found');
    if (collection.userId !== userId) throw new ForbiddenException('Not your collection');
    return collection;
  }

  private format(collection: any) {
    return {
      id: collection.id,
      name: collection.name,
      description: collection.description ?? undefined,
      iconUrl: collection.iconUrl ?? undefined,
      isPublic: collection.isPublic,
      userId: collection.userId,
      user: collection.user,
      createdAt: collection.createdAt instanceof Date ? collection.createdAt.toISOString() : collection.createdAt,
      updatedAt: collection.updatedAt instanceof Date ? collection.updatedAt.toISOString() : collection.updatedAt,
    };
  }
}

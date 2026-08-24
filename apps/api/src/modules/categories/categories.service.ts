import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<any[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { projects: true } },
      },
    });

    return categories.map((c) => this.formatCategory(c));
  }

  async findBySlug(slug: string): Promise<any> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: { select: { projects: true } },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return this.formatCategory(category);
  }

  async findOne(id: string): Promise<any> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { projects: true } },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    return this.formatCategory(category);
  }

  async create(dto: CreateCategoryDto): Promise<any> {
    const existing = await this.prisma.category.findFirst({
      where: { OR: [{ slug: dto.slug }, { name: dto.name }] },
    });
    if (existing) {
      throw new ConflictException('Category with this name or slug already exists');
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        icon: dto.icon,
        color: dto.color,
        order: dto.order ?? 0,
      },
    });

    return this.formatCategory(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<any> {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: dto,
    });

    return this.formatCategory(category);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    const inUse = await this.prisma.project.count({ where: { categoryId: id } });
    if (inUse > 0) {
      throw new ConflictException(
        `Cannot delete category: ${inUse} project(s) still use this category`,
      );
    }

    await this.prisma.category.delete({ where: { id } });
  }

  private formatCategory(category: any): any {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? undefined,
      icon: category.icon ?? undefined,
      color: category.color ?? undefined,
      order: category.order,
      projectCount: category._count?.projects,
      createdAt:
        category.createdAt instanceof Date ? category.createdAt.toISOString() : category.createdAt,
    };
  }
}

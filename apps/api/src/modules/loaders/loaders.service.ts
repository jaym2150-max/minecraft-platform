import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateLoaderDto } from './dto/create-loader.dto';
import { LoaderType } from '@prisma/client';

@Injectable()
export class LoadersService {
  private readonly logger = new Logger(LoadersService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<any[]> {
    const loaders = await this.prisma.loader.groupBy({
      by: ['type', 'versionString'],
      _count: { id: true },
    });
    return loaders.map((l) => ({
      type: l.type,
      versionString: l.versionString,
      projectCount: l._count.id,
    }));
  }

  async findByType(type: LoaderType): Promise<any[]> {
    return this.prisma.loader.findMany({
      where: { type },
      include: {
        project: {
          select: { id: true, title: true, slug: true, status: true },
        },
      },
      take: 100,
    });
  }

  async findByProject(projectId: string): Promise<any[]> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project with id "${projectId}" not found`);
    }

    const loaders = await this.prisma.loader.findMany({
      where: { projectId },
      include: { version: { select: { id: true, version: true } } },
    });

    return loaders.map((l) => ({
      id: l.id,
      type: l.type,
      versionString: l.versionString,
      versionId: l.versionId,
      projectId: l.projectId,
      version: l.version,
    }));
  }

  async create(dto: CreateLoaderDto): Promise<any> {
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) {
      throw new NotFoundException(`Project with id "${dto.projectId}" not found`);
    }

    const version = await this.prisma.projectVersion.findUnique({ where: { id: dto.versionId } });
    if (!version) {
      throw new NotFoundException(`Version with id "${dto.versionId}" not found`);
    }

    const existing = await this.prisma.loader.findFirst({
      where: {
        type: dto.type,
        projectId: dto.projectId,
        versionId: dto.versionId,
      },
    });
    if (existing) {
      throw new ConflictException('This loader is already registered for this project version');
    }

    const loader = await this.prisma.loader.create({
      data: {
        type: dto.type,
        versionString: dto.versionString,
        projectId: dto.projectId,
        versionId: dto.versionId,
      },
    });

    return loader;
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.loader.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Loader with id "${id}" not found`);
    }
    await this.prisma.loader.delete({ where: { id } });
  }
}

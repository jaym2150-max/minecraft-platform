import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDependencyDto, UpdateDependencyDto } from './dto/dependency.dto';

@Injectable()
export class DependenciesService {
  private readonly logger = new Logger(DependenciesService.name);

  constructor(private prisma: PrismaService) {}

  async findByProject(projectId: string): Promise<any[]> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project with id "${projectId}" not found`);
    }

    const dependencies = await this.prisma.dependency.findMany({
      where: { dependentId: projectId },
      include: {
        required: {
          select: { id: true, title: true, slug: true, iconUrl: true, status: true },
        },
        version: { select: { id: true, version: true } },
      },
    });

    return dependencies.map((d) => ({
      id: d.id,
      requiredProject: d.required,
      version: d.version,
      isRequired: d.isRequired,
      isOptional: d.isOptional,
      createdAt: d.createdAt.toISOString(),
    }));
  }

  async create(dependentId: string, dto: CreateDependencyDto): Promise<any> {
    const dependent = await this.prisma.project.findUnique({ where: { id: dependentId } });
    if (!dependent) {
      throw new NotFoundException(`Project with id "${dependentId}" not found`);
    }

    const required = await this.prisma.project.findUnique({ where: { id: dto.requiredId } });
    if (!required) {
      throw new NotFoundException(`Required project with id "${dto.requiredId}" not found`);
    }

    if (dependentId === dto.requiredId) {
      throw new ConflictException('A project cannot depend on itself');
    }

    const existing = await this.prisma.dependency.findFirst({
      where: { dependentId, requiredId: dto.requiredId },
    });
    if (existing) {
      throw new ConflictException('This dependency already exists');
    }

    const dependency = await this.prisma.dependency.create({
      data: {
        dependentId,
        requiredId: dto.requiredId,
        versionId: dto.versionId,
        isRequired: dto.isRequired ?? !dto.isOptional,
        isOptional: dto.isOptional ?? !dto.isRequired,
      },
      include: {
        required: {
          select: { id: true, title: true, slug: true, iconUrl: true },
        },
      },
    });

    return dependency;
  }

  async update(id: string, dto: UpdateDependencyDto): Promise<any> {
    const existing = await this.prisma.dependency.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Dependency with id "${id}" not found`);
    }

    const data: any = {};
    if (dto.isRequired !== undefined) data.isRequired = dto.isRequired;
    if (dto.isOptional !== undefined) data.isOptional = dto.isOptional;

    const updated = await this.prisma.dependency.update({
      where: { id },
      data,
      include: {
        required: {
          select: { id: true, title: true, slug: true, iconUrl: true },
        },
      },
    });

    return updated;
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.dependency.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Dependency with id "${id}" not found`);
    }
    await this.prisma.dependency.delete({ where: { id } });
  }
}

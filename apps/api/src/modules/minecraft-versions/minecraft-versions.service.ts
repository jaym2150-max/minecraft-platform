import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMinecraftVersionDto } from './dto/create-mc-version.dto';

@Injectable()
export class MinecraftVersionsService {
  private readonly logger = new Logger(MinecraftVersionsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<any[]> {
    const versions = await this.prisma.minecraftVersion.findMany({
      orderBy: [{ stable: 'desc' }, { version: 'desc' }],
    });
    return versions.map((v) => this.format(v));
  }

  async findStable(): Promise<any[]> {
    const versions = await this.prisma.minecraftVersion.findMany({
      where: { stable: true },
      orderBy: { version: 'desc' },
    });
    return versions.map((v) => this.format(v));
  }

  async findOne(id: string): Promise<any> {
    const version = await this.prisma.minecraftVersion.findUnique({ where: { id } });
    if (!version) {
      throw new NotFoundException(`Minecraft version with id "${id}" not found`);
    }
    return this.format(version);
  }

  async findByVersionString(version: string): Promise<any> {
    const v = await this.prisma.minecraftVersion.findUnique({ where: { version } });
    if (!v) {
      throw new NotFoundException(`Minecraft version "${version}" not found`);
    }
    return this.format(v);
  }

  async create(dto: CreateMinecraftVersionDto): Promise<any> {
    const existing = await this.prisma.minecraftVersion.findUnique({
      where: { version: dto.version },
    });
    if (existing) {
      throw new ConflictException(`Minecraft version "${dto.version}" already exists`);
    }

    const version = await this.prisma.minecraftVersion.create({
      data: {
        version: dto.version,
        type: dto.type ?? 'release',
        stable: dto.stable ?? true,
      },
    });

    return this.format(version);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.minecraftVersion.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Minecraft version with id "${id}" not found`);
    }
    await this.prisma.minecraftVersion.delete({ where: { id } });
  }

  private format(v: any) {
    return {
      id: v.id,
      version: v.version,
      type: v.type,
      stable: v.stable,
    };
  }
}

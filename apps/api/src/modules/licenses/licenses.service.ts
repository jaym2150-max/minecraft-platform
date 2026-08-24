import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import { LicenseType } from '@prisma/client';

@Injectable()
export class LicensesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const licenses = await this.prisma.license.findMany({
      orderBy: [{ featured: 'desc' }, { name: 'asc' }],
    });
    return licenses.map((l) => this.format(l));
  }

  async findOne(shortIdOrId: string) {
    const where = /^[0-9a-f-]{36}$/i.test(shortIdOrId)
      ? { OR: [{ id: shortIdOrId }, { shortId: shortIdOrId }] }
      : { shortId: shortIdOrId };

    const license = await this.prisma.license.findFirst({ where });
    if (!license) throw new NotFoundException(`License "${shortIdOrId}" not found`);
    return this.format(license);
  }

  async getText(shortIdOrId: string): Promise<{ body: string | null; url: string | null }> {
    const where = /^[0-9a-f-]{36}$/i.test(shortIdOrId)
      ? { OR: [{ id: shortIdOrId }, { shortId: shortIdOrId }] }
      : { shortId: shortIdOrId };

    const license = await this.prisma.license.findFirst({
      where,
      select: { body: true, url: true },
    });
    if (!license) throw new NotFoundException(`License "${shortIdOrId}" not found`);
    return { body: license.body ?? null, url: license.url ?? null };
  }

  async create(dto: CreateLicenseDto) {
    const license = await this.prisma.license.create({
      data: {
        shortId: dto.shortId,
        name: dto.name,
        type: dto.type ?? LicenseType.UNKNOWN,
        url: dto.url,
        description: dto.description,
        body: dto.body,
        featured: dto.featured ?? false,
      },
    });
    return this.format(license);
  }

  private format(l: any) {
    return {
      id: l.id,
      shortId: l.shortId,
      name: l.name,
      type: l.type,
      url: l.url ?? undefined,
      description: l.description ?? undefined,
      featured: l.featured,
      createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
      updatedAt: l.updatedAt instanceof Date ? l.updatedAt.toISOString() : l.updatedAt,
    };
  }
}

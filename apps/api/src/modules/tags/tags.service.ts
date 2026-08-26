import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  list(search?: string) {
    return this.prisma.tag.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { slug: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async get(slugOrId: string) {
    const tag = await this.prisma.tag.findFirst({
      where: { OR: [{ id: slugOrId }, { slug: slugOrId }] },
    });
    if (!tag) throw new NotFoundException(`Tag "${slugOrId}" not found`);
    return tag;
  }

  async create(data: { name: string; slug?: string; description?: string }) {
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);
    const existing = await this.prisma.tag.findFirst({
      where: { OR: [{ name: data.name }, { slug }] },
    });
    if (existing)
      throw new ConflictException(`Tag "${data.name}" or slug "${slug}" already exists`);
    return this.prisma.tag.create({
      data: { name: data.name, slug, description: data.description },
    });
  }

  async update(id: string, data: { name?: string; slug?: string; description?: string }) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException(`Tag "${id}" not found`);
    const update: any = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.slug !== undefined) update.slug = slugify(data.slug);
    else if (data.name !== undefined) update.slug = slugify(data.name);
    if (data.description !== undefined) update.description = data.description;
    return this.prisma.tag.update({ where: { id }, data: update });
  }

  async remove(id: string) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException(`Tag "${id}" not found`);
    await this.prisma.tag.delete({ where: { id } });
  }

  async attach(projectId: string, tagIdOrSlug: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project "${projectId}" not found`);
    const tag = await this.get(tagIdOrSlug);
    const existing = await this.prisma.projectTag.findUnique({
      where: { projectId_tagId: { projectId, tagId: tag.id } },
    });
    if (existing) throw new ConflictException('Tag already attached');
    return this.prisma.projectTag.create({ data: { projectId, tagId: tag.id } });
  }

  async detach(projectId: string, tagIdOrSlug: string) {
    const tag = await this.get(tagIdOrSlug);
    const row = await this.prisma.projectTag.findUnique({
      where: { projectId_tagId: { projectId, tagId: tag.id } },
    });
    if (!row) throw new NotFoundException('Tag not attached to project');
    await this.prisma.projectTag.delete({ where: { id: row.id } });
  }

  async listForProject(projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project "${projectId}" not found`);
    const rows = await this.prisma.projectTag.findMany({
      where: { projectId },
      include: { tag: true },
    });
    return rows.map((r) => r.tag);
  }

  // seed helper — upsert by slug
  async seedDefaults() {
    const defaults = [
      { name: 'Technology', slug: 'technology', description: 'Tech and automation mods' },
      { name: 'Magic', slug: 'magic', description: 'Magic and spell mods' },
      { name: 'Adventure', slug: 'adventure', description: 'Exploration and adventure' },
      { name: 'Optimization', slug: 'optimization', description: 'Performance and optimization' },
      { name: 'Storage', slug: 'storage', description: 'Storage solutions' },
      { name: 'Worldgen', slug: 'worldgen', description: 'World generation' },
      { name: 'Utility', slug: 'utility', description: 'Utilities and helpers' },
      { name: 'Library', slug: 'library', description: 'Libraries and APIs' },
      { name: 'Decoration', slug: 'decoration', description: 'Decorative blocks' },
      { name: 'Gameplay', slug: 'gameplay', description: 'Gameplay tweaks' },
      { name: 'Map', slug: 'map', description: 'Maps and structures' },
      { name: 'Redstone', slug: 'redstone', description: 'Redstone and automation' },
    ];
    for (const d of defaults) {
      await this.prisma.tag.upsert({ where: { slug: d.slug }, update: {}, create: d });
    }
    return defaults.length;
  }
}

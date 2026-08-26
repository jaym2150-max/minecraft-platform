import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

@Injectable()
export class GuidesService {
  constructor(private readonly prisma: PrismaService) {}

  list(opts: { status?: string; category?: string; search?: string; limit?: number } = {}) {
    const where: any = {};
    if (opts.status) where.status = opts.status;
    else where.status = 'PUBLISHED';
    if (opts.category) where.category = opts.category;
    if (opts.search)
      where.OR = [
        { title: { contains: opts.search, mode: 'insensitive' } },
        { excerpt: { contains: opts.search, mode: 'insensitive' } },
      ];
    return this.prisma.guide.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(opts.limit ?? 20, 50),
      include: { author: { select: { username: true } } },
    });
  }

  async get(slugOrId: string) {
    const guide = await this.prisma.guide.findFirst({
      where: { OR: [{ id: slugOrId }, { slug: slugOrId }] },
      include: { author: { select: { username: true } } },
    });
    if (!guide) throw new NotFoundException(`Guide "${slugOrId}" not found`);
    // increment views (best-effort)
    this.prisma.guide
      .update({ where: { id: guide.id }, data: { views: { increment: 1 } } })
      .catch(() => {});
    return guide;
  }

  async create(
    data: {
      title: string;
      slug?: string;
      excerpt?: string;
      body?: string;
      coverUrl?: string;
      category?: string;
      status?: string;
    },
    authorId?: string,
  ) {
    const slug = data.slug ? slugify(data.slug) : slugify(data.title);
    return this.prisma.guide.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        body: data.body,
        coverUrl: data.coverUrl,
        category: data.category,
        status: (data.status as any) ?? 'DRAFT',
        authorId,
      },
    });
  }

  async update(id: string, data: any) {
    const existing = await this.prisma.guide.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Guide "${id}" not found`);
    const upd: any = {};
    if (data.title !== undefined) upd.title = data.title;
    if (data.slug !== undefined) upd.slug = slugify(data.slug);
    if (data.excerpt !== undefined) upd.excerpt = data.excerpt;
    if (data.body !== undefined) upd.body = data.body;
    if (data.coverUrl !== undefined) upd.coverUrl = data.coverUrl;
    if (data.category !== undefined) upd.category = data.category;
    if (data.status !== undefined) upd.status = data.status;
    if (data.featured !== undefined) upd.featured = data.featured;
    return this.prisma.guide.update({ where: { id }, data: upd });
  }

  async remove(id: string) {
    const existing = await this.prisma.guide.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Guide "${id}" not found`);
    await this.prisma.guide.delete({ where: { id } });
  }

  async seed() {
    const defaults = [
      {
        title: 'How to Install Mods with Fabric',
        slug: 'install-fabric-mods',
        excerpt: 'Step-by-step Fabric installation for 1.20-1.21.',
        body: '# Install Fabric\n\n1. Download Fabric Loader...\n\n2. Add mods to `mods/` folder...',
        category: 'installation',
        status: 'PUBLISHED' as any,
      },
      {
        title: 'Best Optimization Mods 2026',
        slug: 'best-optimization-mods-2026',
        excerpt: 'Sodium, Lithium, Starlight and more.',
        body: '# Best Optimization Mods\n\nCompare Sodium vs OptiFine...',
        category: 'best',
        status: 'PUBLISHED' as any,
      },
      {
        title: 'Fixing Mod Conflicts',
        slug: 'fixing-mod-conflicts',
        excerpt: 'Diagnose incompatible mods and loader mismatches.',
        body: '# Fixing Conflicts\n\nCheck logs for `Incompatible`...',
        category: 'troubleshooting',
        status: 'PUBLISHED' as any,
      },
    ];
    let created = 0;
    for (const d of defaults) {
      const exists = await this.prisma.guide.findUnique({ where: { slug: d.slug } });
      if (!exists) {
        await this.prisma.guide.create({ data: d });
        created++;
      }
    }
    return created;
  }
}

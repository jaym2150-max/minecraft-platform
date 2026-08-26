import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma, ProjectStatus, ProjectType, LoaderType, VersionStatus } from '@prisma/client';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';
import { ProjectListQuery, Project } from '@mcp/types';
import { paginateCursor, CursorPage, CursorPaginationDto } from '../../common/pagination';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('analytics') private analyticsQueue: Queue,
    @InjectQueue('search-index') private searchIndexQueue: Queue,
  ) {}

  /**
   * Resolve a project by id (UUID) OR slug. Returns the formatted project or
   * throws NotFoundException. If `trackView` is true (default), increments
   * the view counter and emits an analytics event — set to false on
   * background lookups where the caller doesn't want side effects.
   *
   * `viewer.id` / `viewer.role`, when provided, let the project's own author
   * or platform staff read their own non-PUBLISHED projects. Anonymous and
   * non-owning callers only ever see PUBLISHED projects; everything else
   * returns the same 404 message so existence is not leaked.
   */
  async findByIdOrSlug(
    idOrSlug: string,
    opts: { trackView?: boolean; viewer?: { id: string; role: string } } = {},
  ): Promise<any> {
    const trackView = opts.trackView ?? true;
    const viewer = opts.viewer;
    const where = isUuid(idOrSlug)
      ? { OR: [{ id: idOrSlug }, { slug: idOrSlug }] }
      : { slug: idOrSlug };

    const project = await this.prisma.project.findFirst({
      where,
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        loaders: { select: { type: true } },
        tags: { include: { tag: true } },
        versions: {
          where: { status: 'APPROVED' as any },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, version: true, downloads: true, createdAt: true, status: true },
        },
        galleryImages: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            type: true,
            url: true,
            thumbnailUrl: true,
            alt: true,
            width: true,
            height: true,
            order: true,
          },
        },
        license: { select: { id: true, shortId: true, name: true, type: true, url: true } },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project "${idOrSlug}" not found`);
    }

    const isOwner = !!viewer && project.authorId === viewer.id;
    const isStaff =
      !!viewer && ['MODERATOR', 'ADMIN', 'OWNER'].includes((viewer.role ?? '').toUpperCase());
    if (project.status !== ProjectStatus.PUBLISHED && !isOwner && !isStaff) {
      throw new NotFoundException(`Project "${idOrSlug}" not found`);
    }

    if (trackView) {
      this.prisma.project
        .update({
          where: { id: project.id },
          data: { views: { increment: 1 } },
        })
        .catch((err) => this.logger.warn(`Failed to increment view count: ${err.message}`));

      this.analyticsQueue
        .add('pageview', { projectId: project.id })
        .catch((err) => this.logger.warn(`Failed to enqueue analytics: ${err.message}`));
    }

    return this.formatProject(project);
  }

  /** Strict 404 helper — useful for routes that accept id or slug. */
  async findProjectOr404(idOrSlug: string, viewer?: { id: string; role: string }): Promise<any> {
    return this.findByIdOrSlug(idOrSlug, { trackView: false, viewer });
  }

  /**
   * Bulk fetch projects by a list of ids (and/or slugs). Returns formatted
   * projects in input order when possible. Missing ids are silently dropped
   * to match Modrinth/CurseForge behavior. Calls are anonymous (no viewer
   * context), so only PUBLISHED projects are ever surfaced.
   */
  async findByIds(ids: string[]): Promise<any[]> {
    if (!ids.length) return [];
    const normalized = Array.from(new Set(ids.filter(Boolean)));
    const uuidFilter = normalized.filter(isUuid);
    const slugFilter = normalized.filter((v) => !isUuid(v));

    const projects = await this.prisma.project.findMany({
      where: {
        AND: [
          {
            OR: [
              ...(uuidFilter.length ? [{ id: { in: uuidFilter } }] : []),
              ...(uuidFilter.length ? [{ slug: { in: uuidFilter } }] : []),
              ...(slugFilter.length ? [{ slug: { in: slugFilter } }] : []),
            ],
          },
          { status: ProjectStatus.PUBLISHED },
        ],
      },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        loaders: { select: { type: true } },
        versions: {
          where: { status: 'APPROVED' as any },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { version: true },
        },
        license: { select: { id: true, shortId: true, name: true, type: true, url: true } },
      },
    });

    return projects.map((p) => this.formatProject(p));
  }

  /**
   * Generate a URL-safe slug from a title string.
   * Appends a short random suffix if a collision is detected.
   */
  private async generateUniqueSlug(title: string, existingId?: string): Promise<string> {
    const baseSlug =
      title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'project';

    let slug = baseSlug;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const existing = await this.prisma.project.findUnique({ where: { slug } });
      if (!existing || (existingId && existing.id === existingId)) {
        return slug;
      }
      // Append random 4-char suffix
      const suffix = Math.random().toString(36).substring(2, 6);
      slug = `${baseSlug}-${suffix}`;
      attempts++;
    }

    // Fallback: extremely unlikely, but use uuid fragment
    return `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;
  }

  async create(dto: CreateProjectDto, userId: string): Promise<any> {
    const slug = await this.generateUniqueSlug(dto.title);

    const project = await this.prisma.project.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        body: dto.body,
        iconUrl: dto.iconUrl,
        coverUrl: dto.coverUrl,
        sourceUrl: dto.sourceUrl,
        discordUrl: dto.discordUrl,
        wikiUrl: dto.wikiUrl,
        clientSide: dto.clientSide ?? true,
        serverSide: dto.serverSide ?? true,
        projectType: (dto.projectType as any) ?? ProjectType.MOD,
        status: ProjectStatus.DRAFT,
        authorId: userId,
        categoryId: dto.categoryId,
      },
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        loaders: true,
      },
    });

    this.searchIndexQueue
      .add('upsert', { projectId: project.id })
      .catch((err) => this.logger.warn(`Failed to enqueue search-index: ${err.message}`));

    return this.formatProject(project);
  }

  async findAll(query: ProjectListQuery | QueryProjectsDto): Promise<{
    data: any[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      nextCursor: string | null;
      hasMore: boolean;
    };
  }> {
    // `cursor` (an opaque page pointer from the browse infinite-scroll hook)
    // takes precedence over `page`, so one route serves both offset and
    // infinite-scroll clients. use-browse passes the previous page's
    // `nextCursor` straight back in here.
    const q = query as QueryProjectsDto;
    const page = q.cursor ? Math.max(1, parseInt(q.cursor, 10) || 1) : (q.page ?? 1);
    const limit = q.limit ?? 20;
    const skip = (page - 1) * limit;
    const order = q.order ?? 'desc';
    const sort = q.sort ?? 'createdAt';

    const where = this.buildProjectWhere(q);

    // Validate sort field to prevent injection
    const allowedSortFields = ['downloads', 'updatedAt', 'createdAt', 'title'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'createdAt';

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ promotedUntil: { sort: 'desc', nulls: 'last' } }, { [sortField]: order }],
        include: {
          author: {
            select: { id: true, username: true, avatarUrl: true },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
          loaders: {
            select: { type: true },
          },
          tags: {
            include: { tag: true },
          },
          versions: {
            where: { status: 'APPROVED' as any },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { version: true },
          },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;
    return {
      data: projects.map((p) => this.formatProject(p)),
      meta: {
        page,
        limit,
        total,
        totalPages,
        nextCursor: hasMore ? String(page + 1) : null,
        hasMore,
      },
    };
  }

  /**
   * Cursor-based pagination. Returns `{ data, nextCursor, hasMore }` and
   * supports the same multi-select facets as `findAll` via buildProjectWhere.
   * The cursor encodes the last-seen project's id; clients pass it back
   * unchanged on the next call. Not used by the browse UI (which prefers
   * `findAll`'s total-aware page cursor) but kept for programmatic clients.
   */
  async findAllCursor(
    query: QueryProjectsDto & CursorPaginationDto & { license?: string },
  ): Promise<CursorPage<any>> {
    const where = this.buildProjectWhere(query);

    const order = query.order ?? 'desc';
    const sort = query.sort ?? 'createdAt';
    const allowedSortFields = ['downloads', 'updatedAt', 'createdAt', 'title'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'createdAt';

    return paginateCursor<any>({
      take: query.limit ?? 20,
      cursor: query.cursor,
      where,
      orderBy: { [sortField]: order },
      prismaDelegate: {
        findMany: (args) =>
          this.prisma.project.findMany({
            ...(args as any),
            include: {
              author: { select: { id: true, username: true, avatarUrl: true } },
              category: { select: { id: true, name: true, slug: true } },
              loaders: { select: { type: true } },
              versions: {
                where: { status: 'APPROVED' as any },
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: { version: true },
              },
              license: { select: { id: true, shortId: true, name: true, type: true, url: true } },
            },
          }),
      },
    }).then((page) => ({
      ...page,
      data: page.data.map((p) => this.formatProject(p)),
    }));
  }

  async findBySlug(slug: string): Promise<any> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    const project = await this.prisma.project.findFirst({
      where: isUuid ? { OR: [{ slug }, { id: slug }] } : { slug },
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        loaders: {
          select: { type: true },
        },
        versions: {
          where: { status: 'APPROVED' as any },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, version: true, downloads: true, createdAt: true, status: true },
        },
        galleryImages: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            type: true,
            url: true,
            thumbnailUrl: true,
            alt: true,
            width: true,
            height: true,
            order: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project not found`);
    }

    this.prisma.project
      .update({
        where: { id: project.id },
        data: { views: { increment: 1 } },
      })
      .catch((err) => this.logger.warn(`Failed to increment view count: ${err.message}`));

    this.analyticsQueue
      .add('pageview', { projectId: project.id })
      .catch((err) => this.logger.warn(`Failed to enqueue analytics: ${err.message}`));

    return this.formatProject(project);
  }

  async findOne(id: string): Promise<any> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        loaders: {
          select: { type: true },
        },
        versions: {
          orderBy: { createdAt: 'desc' },
          select: { id: true, version: true, downloads: true, createdAt: true, status: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with id "${id}" not found`);
    }

    return this.formatProject(project);
  }

  async update(id: string, dto: UpdateProjectDto): Promise<any> {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Project with id "${id}" not found`);
    }

    const updateData: Prisma.ProjectUpdateInput = {};

    if (dto.title !== undefined) {
      // If title changed, regenerate slug
      updateData.title = dto.title;
      updateData.slug = await this.generateUniqueSlug(dto.title, id);
    }
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.body !== undefined) updateData.body = dto.body;
    if (dto.iconUrl !== undefined) updateData.iconUrl = dto.iconUrl;
    if (dto.coverUrl !== undefined) updateData.coverUrl = dto.coverUrl;
    if (dto.sourceUrl !== undefined) updateData.sourceUrl = dto.sourceUrl;
    if (dto.discordUrl !== undefined) updateData.discordUrl = dto.discordUrl;
    if (dto.wikiUrl !== undefined) updateData.wikiUrl = dto.wikiUrl;
    if (dto.clientSide !== undefined) updateData.clientSide = dto.clientSide;
    if (dto.serverSide !== undefined) updateData.serverSide = dto.serverSide;
    if (dto.projectType !== undefined) updateData.projectType = dto.projectType as any;
    if (dto.categoryId !== undefined) {
      updateData.category = dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : { disconnect: true };
    }

    const project = await this.prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        loaders: {
          select: { type: true },
        },
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, version: true },
        },
      },
    });

    this.searchIndexQueue
      .add('upsert', { projectId: id })
      .catch((err) => this.logger.warn(`Failed to enqueue search-index: ${err.message}`));

    return this.formatProject(project);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Project with id "${id}" not found`);
    }

    await this.prisma.$transaction([
      this.prisma.loader.deleteMany({ where: { projectId: id } }),
      this.prisma.dependency.deleteMany({ where: { dependentId: id } }),
      this.prisma.dependency.deleteMany({ where: { requiredId: id } }),
      this.prisma.comment.deleteMany({ where: { projectId: id } }),
      this.prisma.review.deleteMany({ where: { projectId: id } }),
      this.prisma.follow.deleteMany({ where: { projectId: id } }),
      this.prisma.teamMember.deleteMany({ where: { projectId: id } }),
      this.prisma.team.deleteMany({ where: { projectId: id } }),
      this.prisma.download.deleteMany({ where: { projectId: id } }),
      this.prisma.projectVersion.deleteMany({ where: { projectId: id } }),
      this.prisma.project.delete({ where: { id } }),
    ]);

    this.searchIndexQueue
      .add('delete', { projectId: id })
      .catch((err) => this.logger.warn(`Failed to enqueue search-index: ${err.message}`));
  }

  async getRelatedProjects(
    categoryId: string,
    excludeId: string,
    limit: number = 6,
  ): Promise<any[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        categoryId,
        id: { not: excludeId },
        status: ProjectStatus.PUBLISHED,
      },
      take: limit,
      orderBy: { downloads: 'desc' },
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        loaders: {
          select: { type: true },
        },
      },
    });

    return projects.map((p) => this.formatProject(p));
  }

  async incrementDownloads(id: string): Promise<void> {
    await this.prisma.project.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });
  }

  /**
   * Aggregated facet counts for the browse sidebar — distinct
   * (loader.type, loader.versionString) combinations joined to projects of
   * the requested status. Used to render compat-aware version pills.
   */
  async getLoaderVersionCompatibility(
    opts: {
      status?: ProjectStatus;
    } = {},
  ): Promise<{
    total: number;
    loaders: { type: LoaderType; gameVersion: string; projectCount: number }[];
  }> {
    const status = opts.status ?? ProjectStatus.PUBLISHED;

    const rows = await this.prisma.loader.findMany({
      where: {
        project: { status },
        versionString: { not: null },
      },
      select: { type: true, versionString: true, projectId: true },
    });

    const agg = new Map<string, { type: LoaderType; gameVersion: string; projectCount: number }>();
    for (const row of rows) {
      if (!row.versionString) continue;
      const key = `${row.type}|${row.versionString}`;
      const existing = agg.get(key);
      if (existing) {
        existing.projectCount += 1;
      } else {
        agg.set(key, { type: row.type, gameVersion: row.versionString, projectCount: 1 });
      }
    }

    const loaders = Array.from(agg.values())
      .filter((l) => l.projectCount > 0)
      .sort((a, b) => b.projectCount - a.projectCount);

    return {
      total: rows.length,
      loaders,
    };
  }

  async getTrending(period: string, limit: number) {
    const daysMap: Record<string, number> = { today: 1, week: 7, month: 30 };
    const days = daysMap[period] ?? 7;
    const cutoff = new Date(Date.now() - days * 24 * 3600 * 1000);
    const now = Date.now();
    const raw = await this.prisma.project.findMany({
      where: { status: ProjectStatus.PUBLISHED, updatedAt: { gte: cutoff } },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        loaders: { select: { type: true } },
        tags: { include: { tag: true } },
        versions: {
          where: { status: VersionStatus.APPROVED as any },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { version: true },
        },
        _count: { select: { follows: true } },
      },
    });
    // fallback: if window too narrow, widen to 90d
    let pool = raw;
    if (pool.length < Math.min(5, limit)) {
      pool = await this.prisma.project.findMany({
        where: { status: ProjectStatus.PUBLISHED },
        include: {
          author: { select: { id: true, username: true, avatarUrl: true } },
          category: { select: { id: true, name: true, slug: true } },
          loaders: { select: { type: true } },
          tags: { include: { tag: true } },
          versions: {
            where: { status: VersionStatus.APPROVED as any },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { version: true },
          },
          _count: { select: { follows: true } },
        },
        take: limit * 3,
        orderBy: { updatedAt: 'desc' },
      });
    }
    const scored = pool.map((p: any) => {
      const downloads = p.downloads ?? 0;
      const views = p.views ?? 0;
      const followers = p._count?.follows ?? 0;
      const rating = p.ratingAverage ?? 0;
      const count = p.ratingCount ?? 0;
      const updated =
        p.updatedAt instanceof Date ? p.updatedAt.getTime() : new Date(p.updatedAt).getTime();
      const created =
        p.createdAt instanceof Date ? p.createdAt.getTime() : new Date(p.createdAt).getTime();
      const daysSinceUpdate = Math.max(0, (now - updated) / 86400000);
      const daysSinceCreate = Math.max(1, (now - created) / 86400000);
      const velocity = downloads / daysSinceCreate;
      const ratingScore = rating * Math.log1p(count);
      const recentBoost = Math.max(0, ((days - daysSinceUpdate) / days) * 50);
      const score =
        downloads * 0.45 +
        velocity * 8 +
        views * 0.06 +
        followers * 3.5 +
        ratingScore * 12 +
        recentBoost;
      return { p, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(({ p }) => this.formatProject(p));
  }

  /**
   * Merge singular + plural facet params into one de-duplicated string[].
   * e.g. `category` + `categories` both contribute; `license` + `licenses`
   * fold together. Variadic so callers can combine several aliases at once.
   */
  private mergeFacets(...parts: (string[] | string | undefined)[]): string[] {
    const out = new Set<string>();
    for (const part of parts) {
      if (Array.isArray(part)) {
        for (const v of part) if (v !== null && v !== undefined && v !== '') out.add(String(v));
      } else if (part !== null && part !== undefined && part !== '') {
        out.add(String(part));
      }
    }
    return [...out];
  }

  /**
   * Build the Prisma `where` for project list queries from the unified facet
   * DTO. Validates enum-backed filters (loaders, projectTypes) and matches
   * categories/licenses by id OR slug so the facet sidebar (which emits ids)
   * and legacy SDK callers (which emit slugs) both resolve correctly.
   *
   * Multi-select behaviors:
   *  - categories/loaders/projectTypes/licenses/gameVersions: AND across
   *    different facets, OR within a facet (a project matches if it satisfies
   *    ANY selected value of that facet) — standard Modrinth semantics.
   *  - environments (client/server): OR across selected sides.
   */
  private buildProjectWhere(query: QueryProjectsDto): Prisma.ProjectWhereInput {
    const where: Prisma.ProjectWhereInput = {};
    const conditions: Prisma.ProjectWhereInput[] = [];

    if (query.search) {
      conditions.push({
        OR: [{ title: { contains: query.search } }, { description: { contains: query.search } }],
      });
    }

    const categories = this.mergeFacets(query.categories, query.category);
    if (categories.length) {
      conditions.push({
        category: { OR: [{ id: { in: categories } }, { slug: { in: categories } }] },
      });
    }

    const requestedLoaders = this.mergeFacets(query.loaders, query.loader).map((l) =>
      l.toUpperCase(),
    );
    const loaderVals = (Object.values(LoaderType) as LoaderType[]).filter((l) =>
      requestedLoaders.includes(l),
    );
    if (loaderVals.length) {
      conditions.push({ loaders: { some: { type: { in: loaderVals } } } });
    }

    const requestedTypes = this.mergeFacets(query.projectTypes, query.projectType).map((t) =>
      t.toUpperCase(),
    );
    const typeVals = (Object.values(ProjectType) as ProjectType[]).filter((t) =>
      requestedTypes.includes(t),
    );
    if (typeVals.length) {
      conditions.push({ projectType: { in: typeVals } });
    }

    // A project exposes a game version if any of its version-loader rows store
    // that version string on the Loader.versionString column.
    const gameVersions = this.mergeFacets(query.gameVersions, query.gameVersion);
    if (gameVersions.length) {
      conditions.push({ loaders: { some: { versionString: { in: gameVersions } } } });
    }

    const licenses = this.mergeFacets(query.licenses, query.license, query.licenseId);
    if (licenses.length) {
      conditions.push({
        license: { OR: [{ id: { in: licenses } }, { shortId: { in: licenses } }] },
      });
    }

    const tags = this.mergeFacets((query as any).tags, (query as any).tag);
    if (tags.length) {
      conditions.push({
        tags: { some: { tag: { OR: [{ id: { in: tags } }, { slug: { in: tags } }] } } },
      });
    }

    if (query.environments?.length) {
      const envs = query.environments.filter((e) => e === 'client' || e === 'server');
      if (envs.length) {
        // OR across requested sides — matches Modrinth's environment facet.
        conditions.push({
          OR: [
            ...(envs.includes('client') ? [{ clientSide: true }] : []),
            ...(envs.includes('server') ? [{ serverSide: true }] : []),
          ],
        });
      }
    }

    if (query.status) conditions.push({ status: query.status });
    if (query.author) conditions.push({ authorId: query.author });

    if (conditions.length > 0) where.AND = conditions;
    return where;
  }

  /**
   * Format a Prisma project object into the API response shape.
   * Converts dates to ISO strings, nulls to undefined, and extracts loader types.
   */
  private formatProject(project: any): any {
    const loaderTypes =
      project.loaders?.map((l: any) => (typeof l === 'string' ? l : l.type)) ?? [];

    return {
      id: project.id,
      title: project.title,
      slug: project.slug,
      description: project.description,
      body: project.body ?? undefined,
      iconUrl: project.iconUrl ?? undefined,
      coverUrl: project.coverUrl ?? undefined,
      sourceUrl: project.sourceUrl ?? undefined,
      discordUrl: project.discordUrl ?? undefined,
      wikiUrl: project.wikiUrl ?? undefined,
      downloads: project.downloads,
      views: project.views,
      status: project.status,
      projectType: project.projectType,
      featured: project.featured,
      promotedUntil: project.promotedUntil?.toISOString?.() ?? project.promotedUntil ?? undefined,
      clientSide: project.clientSide,
      serverSide: project.serverSide,
      authorId: project.authorId,
      categoryId: project.categoryId ?? undefined,
      createdAt:
        project.createdAt instanceof Date ? project.createdAt.toISOString() : project.createdAt,
      updatedAt:
        project.updatedAt instanceof Date ? project.updatedAt.toISOString() : project.updatedAt,
      author: project.author
        ? {
            id: project.author.id,
            username: project.author.username,
            avatarUrl: project.author.avatarUrl ?? undefined,
          }
        : undefined,
      category: project.category
        ? {
            id: project.category.id,
            name: project.category.name,
            slug: project.category.slug,
          }
        : undefined,
      loaders: loaderTypes,
      tags: (project.tags ?? []).map((pt: any) => pt.tag ?? pt),
      latestVersion: project.versions?.[0]?.version ?? undefined,
      ratingAverage: project.ratingAverage ?? 0,
      ratingCount: project.ratingCount ?? 0,
      licenseId: project.licenseId ?? undefined,
      license: project.license
        ? {
            id: project.license.id,
            shortId: project.license.shortId,
            name: project.license.name,
            type: project.license.type,
            url: project.license.url ?? undefined,
          }
        : undefined,
      galleryImages: project.galleryImages ?? [],
    };
  }
}

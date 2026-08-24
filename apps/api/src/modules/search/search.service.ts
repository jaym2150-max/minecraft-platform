import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch, Index } from 'meilisearch';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Strict allow-lists for values interpolated into the Meilisearch filter DSL.
 *
 * SECURITY: Meilisearch filters are an expression language, NOT a parameterized
 * query. Interpolating raw user input (e.g. `categoryId = "<input>"`) lets an
 * attacker break out of the intended `status = 'PUBLISHED'` constraint and read
 * DRAFT / REJECTED / ARCHIVED projects, or inject arbitrary boolean expressions.
 * We therefore only ever emit enum members we control, and reject anything else.
 */
const ALLOWED_LOADER_VALUES: ReadonlySet<string> = new Set([
  'FABRIC',
  'FORGE',
  'NEOFORGE',
  'QUILT',
  'BUKKIT',
  'SPIGOT',
  'PAPER',
  'PURPUR',
]);

const ALLOWED_SORTS: ReadonlySet<string> = new Set([
  'downloads:desc',
  'downloads:asc',
  'views:desc',
  'views:asc',
  'createdAt:desc',
  'createdAt:asc',
  'updatedAt:desc',
  'updatedAt:asc',
]);

/**
 * Validate a category identifier. Categories are referenced by UUID in the
 * index (`categoryId`), so we require a strict UUID v4 shape. Anything else
 * (including filter-language metacharacters like `"`, `=`, spaces) is dropped.
 */
function isValidCategoryId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client: MeiliSearch | null = null;
  private projectIndex: Index | null = null;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async onModuleInit() {
    const url = this.config.get<string>('MEILISEARCH_URL');
    const apiKey = this.config.get<string>('MEILISEARCH_API_KEY');

    if (!url) {
      this.logger.warn('MEILISEARCH_URL not configured - search disabled');
      return;
    }

    try {
      this.client = new MeiliSearch({ host: url, apiKey });
      this.projectIndex = this.client.index('projects');
      await this.ensureIndex();
      this.logger.log('Meilisearch client initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize Meilisearch: ${(error as Error).message}`);
    }
  }

  private async ensureIndex() {
    if (!this.projectIndex) return;
    try {
      await this.projectIndex.updateSettings({
        searchableAttributes: ['title', 'description', 'body', 'authorName', 'categoryName'],
        filterableAttributes: ['status', 'categoryId', 'loaders', 'authorId', 'featured'],
        sortableAttributes: ['downloads', 'views', 'createdAt', 'updatedAt'],
        rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
      });
    } catch (error) {
      this.logger.warn(`Index settings update failed: ${(error as Error).message}`);
    }
  }

  async search(
    query: string,
    options: {
      page?: number;
      limit?: number;
      category?: string;
      loader?: string;
      sort?: string;
    } = {},
  ): Promise<any> {
    const page = Math.max(1, Number(options.page ?? 1) || 1);
    const limit = Math.min(50, Math.max(1, Number(options.limit ?? 20) || 20));
    const offset = (page - 1) * limit;

    if (!this.projectIndex) {
      return this.fallbackSearch(query, options, page, limit);
    }

    try {
      // SECURITY: build the filter expression only from validated allow-list
      // values. Never interpolate raw user input into the filter DSL.
      // Even though the values are allow-listed/shape-validated, we still emit
      // them as quoted Meilisearch string literals so the expression is robust
      // against any future change to the validation set.
      const filters: string[] = ["status = 'PUBLISHED'"];
      if (options.category && isValidCategoryId(options.category)) {
        filters.push(`categoryId = '${options.category}'`);
      }
      if (options.loader && ALLOWED_LOADER_VALUES.has(options.loader)) {
        filters.push(`loaders = '${options.loader}'`);
      }

      const sort = options.sort && ALLOWED_SORTS.has(options.sort)
        ? [options.sort]
        : undefined;

      const result = await this.projectIndex.search(query, {
        limit,
        offset,
        filter: filters,
        sort,
      });

      return {
        data: result.hits,
        meta: {
          page,
          limit,
          total: result.estimatedTotalHits ?? result.hits.length,
          totalPages: Math.ceil((result.estimatedTotalHits ?? result.hits.length) / limit),
          query,
          processingTimeMs: result.processingTimeMs,
        },
      };
    } catch (error) {
      this.logger.error(`Search failed: ${(error as Error).message}`);
      return this.fallbackSearch(query, options, page, limit);
    }
  }

  private async fallbackSearch(
    query: string,
    options: { category?: string; sort?: string },
    page: number,
    limit: number,
  ) {
    const where: any = { status: 'PUBLISHED' };
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }
    if (options.category) {
      where.category = { slug: options.category };
    }

    const orderBy: any = { createdAt: 'desc' };
    if (options.sort === 'downloads') orderBy.downloads = 'desc';
    if (options.sort === 'updatedAt') orderBy.updatedAt = 'desc';

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          author: { select: { id: true, username: true, avatarUrl: true } },
          category: { select: { id: true, name: true, slug: true } },
          loaders: { select: { type: true } },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data: projects.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        downloads: p.downloads,
        views: p.views,
        iconUrl: p.iconUrl,
        status: p.status,
        author: p.author,
        category: p.category,
        loaders: p.loaders.map((l) => l.type),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        query,
        source: 'database',
      },
    };
  }

  async indexProject(projectId: string): Promise<void> {
    if (!this.projectIndex) return;

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        author: { select: { username: true } },
        category: { select: { id: true, name: true } },
        loaders: { select: { type: true } },
      },
    });

    if (!project) return;

    try {
      await this.projectIndex.addDocuments([
        {
          id: project.id,
          title: project.title,
          slug: project.slug,
          description: project.description,
          body: project.body ?? '',
          authorId: project.authorId,
          authorName: project.author?.username ?? '',
          categoryId: project.categoryId ?? '',
          categoryName: project.category?.name ?? '',
          loaders: project.loaders.map((l) => l.type),
          downloads: project.downloads,
          views: project.views,
          status: project.status,
          featured: project.featured,
          iconUrl: project.iconUrl,
          createdAt: project.createdAt.getTime(),
          updatedAt: project.updatedAt.getTime(),
        },
      ]);
    } catch (error) {
      this.logger.error(`Failed to index project ${projectId}: ${(error as Error).message}`);
    }
  }

  async removeFromIndex(projectId: string): Promise<void> {
    if (!this.projectIndex) return;
    try {
      await this.projectIndex.deleteDocument(projectId);
    } catch (error) {
      this.logger.error(`Failed to remove project ${projectId} from index: ${(error as Error).message}`);
    }
  }

  async reindexAll(): Promise<{ count: number }> {
    if (!this.projectIndex) {
      throw new Error('Search index not available');
    }

    const BATCH_SIZE = 500;
    let totalIndexed = 0;
    let cursor: string | null = null;
    let hasMore = true;

    while (hasMore) {
      const projects: Prisma.ProjectGetPayload<{
        include: {
          author: { select: { username: boolean } };
          category: { select: { id: boolean; name: boolean } };
          loaders: { select: { type: boolean } };
        };
      }>[] = await this.prisma.project.findMany({
        where: { status: 'PUBLISHED' },
        take: BATCH_SIZE,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        include: {
          author: { select: { username: true } },
          category: { select: { id: true, name: true } },
          loaders: { select: { type: true } },
        },
        orderBy: { id: 'asc' },
      });

      if (projects.length === 0) {
        hasMore = false;
        break;
      }

      cursor = projects[projects.length - 1].id;

      const documents = projects.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        body: p.body ?? '',
        authorId: p.authorId,
        authorName: p.author?.username ?? '',
        categoryId: p.categoryId ?? '',
        categoryName: p.category?.name ?? '',
        loaders: p.loaders.map((l) => l.type),
        downloads: p.downloads,
        views: p.views,
        status: p.status,
        featured: p.featured,
        iconUrl: p.iconUrl,
        createdAt: p.createdAt.getTime(),
        updatedAt: p.updatedAt.getTime(),
      }));

      await this.projectIndex.addDocuments(documents);
      totalIndexed += documents.length;

      if (projects.length < BATCH_SIZE) {
        hasMore = false;
      }
    }

    return { count: totalIndexed };
  }
}

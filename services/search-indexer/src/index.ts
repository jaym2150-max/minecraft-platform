import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: true });


import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { MeiliSearch } from 'meilisearch';
import { PrismaClient } from '@prisma/client';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
const MEILISEARCH_URL = process.env.MEILISEARCH_URL || 'http://localhost:7700';
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || '';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://mcp:mcp@localhost:5432/minecraft_platform';

const connection = new IORedis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  // M-W: lazyConnect + ping in main() (see notification-worker).
  lazyConnect: true,
});

const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } },
});

const meili = new MeiliSearch({ host: MEILISEARCH_URL, apiKey: MEILISEARCH_API_KEY });
const INDEX_NAME = 'projects';

interface IndexJobData {
  type: 'upsert' | 'delete' | 'reindex' | 'sync-all';
  projectId?: string;
  projectData?: any;
}

async function ensureIndex() {
  try {
    const index = meili.index(INDEX_NAME);
    await index.updateSettings({
      searchableAttributes: ['title', 'description', 'body', 'authorName', 'categoryName'],
      filterableAttributes: ['status', 'categoryId', 'loaders', 'authorId', 'featured'],
      sortableAttributes: ['downloads', 'views', 'createdAt', 'updatedAt'],
      rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
    });
    console.log('[search-indexer] Index settings updated');
  } catch (error) {
    console.error('[search-indexer] Failed to ensure index:', (error as Error).message);
  }
}

async function indexProject(project: any): Promise<any> {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    description: project.description,
    body: project.body ?? '',
    authorId: project.authorId,
    authorName: project.author?.username ?? '',
    categoryId: project.categoryId ?? '',
    categoryName: project.category?.name ?? '',
    loaders: (project.loaders ?? []).map((l: any) => (typeof l === 'string' ? l : l.type)),
    downloads: project.downloads,
    views: project.views,
    status: project.status,
    featured: project.featured,
    iconUrl: project.iconUrl,
    createdAt: new Date(project.createdAt).getTime(),
    updatedAt: new Date(project.updatedAt).getTime(),
  };
}

async function processIndex(job: Job<IndexJobData>): Promise<any> {
  const { type, projectId, projectData } = job.data;

  console.log(`[search-indexer] Processing ${type} job...`);
  await job.updateProgress(10);

  if (type === 'upsert' && projectId) {
    let project = projectData;
    if (!project) {
      project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          author: { select: { username: true } },
          category: { select: { id: true, name: true } },
          loaders: { select: { type: true } },
        },
      });
    }
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }
    // Status-driven indexing: only PUBLISHED projects land in the index.
    // DRAFT / REJECTED / ARCHIVED projects are removed. This closes the
    // audit's "soft-delete not handled" drift: a status transition away
    // from PUBLISHED no longer leaves the document queryable.
    if (project.status !== 'PUBLISHED') {
      try {
        const result = await meili.index(INDEX_NAME).deleteDocument(projectId);
        console.log(`[search-indexer] Removed non-published project ${projectId} (status=${project.status}, task: ${result.taskUid})`);
        await job.updateProgress(100);
        return { type: 'delete', projectId, reason: `status=${project.status}`, taskUid: result.taskUid };
      } catch (err) {
        // deleteDocument 404s if the doc isn't in the index; that's fine —
        // we just wanted to make sure it isn't there.
        if (!(err as Error)?.message?.includes('not found')) throw err;
        await job.updateProgress(100);
        return { type: 'delete', projectId, reason: 'not present' };
      }
    }
    const document = await indexProject(project);
    const result = await meili.index(INDEX_NAME).addDocuments([document]);
    await job.updateProgress(100);
    console.log(`[search-indexer] Upserted project ${projectId} (task: ${result.taskUid})`);
    return { type, projectId, taskUid: result.taskUid };
  }

  if (type === 'delete' && projectId) {
    const result = await meili.index(INDEX_NAME).deleteDocument(projectId);
    await job.updateProgress(100);
    console.log(`[search-indexer] Deleted project ${projectId} (task: ${result.taskUid})`);
    return { type, projectId, taskUid: result.taskUid };
  }

  if (type === 'sync-all' || type === 'reindex') {
    const BATCH_SIZE = 500;
    let totalIndexed = 0;
    let cursor: string | null = null;
    let hasMore = true;

    while (hasMore) {
      const findArgs: any = {
        where: { status: 'PUBLISHED' },
        take: BATCH_SIZE,
        include: {
          author: { select: { username: true } },
          category: { select: { id: true, name: true } },
          loaders: { select: { type: true } },
        },
        orderBy: { id: 'asc' as const },
      };
      if (cursor) {
        findArgs.skip = 1;
        findArgs.cursor = { id: cursor };
      }

      const projects: any[] = await prisma.project.findMany(findArgs);

      if (projects.length === 0) {
        hasMore = false;
        break;
      }

      cursor = projects[projects.length - 1].id;

      const documents = await Promise.all(projects.map(indexProject));
      await meili.index(INDEX_NAME).addDocuments(documents);
      totalIndexed += documents.length;

      if (projects.length < BATCH_SIZE) {
        hasMore = false;
      }
    }

    await job.updateProgress(100);
    console.log(`[search-indexer] Reindexed ${totalIndexed} projects`);
    return { type, count: totalIndexed };
  }

  throw new Error(`Unknown job type: ${type}`);
}

const worker = new Worker<IndexJobData>('search-index', processIndex, {
  connection,
  concurrency: 1,
});

worker.on('completed', (job, result) => {
  console.log(`[search-indexer] Job ${job.id} completed:`, result);
});

worker.on('failed', (job, err) => {
  console.error(`[search-indexer] Job ${job?.id} failed:`, err.message);
});

(async () => {
  try {
    await connection.ping();
    console.log('[search-indexer] Connected to Redis');
  } catch (err) {
    console.error(
      `[search-indexer] Failed to connect to Redis at ${REDIS_HOST}:${REDIS_PORT}: ${(err as Error).message}`,
    );
    console.error('[search-indexer] Ensure Redis is running. Exiting.');
    process.exit(1);
  }
  await ensureIndex();
  console.log('[search-indexer] Service started, listening for index jobs...');
})().catch((err) => {
  console.error('[search-indexer] Startup failed:', err);
  process.exit(1);
});

let shuttingDown = false;
let shutdownWatchdog: ReturnType<typeof setTimeout> | null = null;

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  shutdownWatchdog = setTimeout(() => { console.error('[search-indexer] Shutdown timed out, forcing exit'); process.exit(1); }, 25000);
  if (shutdownWatchdog && (shutdownWatchdog as any).unref) (shutdownWatchdog as any).unref();
  console.log('[search-indexer] Shutting down...');
  try {
    await worker.close();
    await connection.quit();
    await prisma.$disconnect();
  } catch (err) {
    console.error('[search-indexer] Shutdown error:', err instanceof Error ? err.message : err);
  } finally {
    if (shutdownWatchdog) clearTimeout(shutdownWatchdog);
    process.exit(0);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export { processIndex, indexProject, ensureIndex };
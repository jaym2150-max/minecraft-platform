import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: true });

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaClient } from '@prisma/client';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
const DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://mcp:mcp@localhost:5432/minecraft_platform';

const connection = new IORedis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  // M-W: lazyConnect + main() ping below so the "Service started" log does
  // not race ahead of the actual Redis handshake (see notification-worker).
  lazyConnect: true,
});

const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } },
});

interface AnalyticsJobData {
  type: 'pageview' | 'download' | 'install' | 'playtime' | 'aggregate';
  projectId?: string;
  versionId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  referer?: string;
  duration?: number;
  country?: string;
}

async function processAnalytics(job: Job<AnalyticsJobData>): Promise<any> {
  const { type, projectId, versionId, userId, ip, userAgent, country } = job.data;

  console.log(`[analytics-worker] Processing ${type} event for project ${projectId ?? 'n/a'}`);
  await job.updateProgress(20);

  switch (type) {
    case 'pageview': {
      if (!projectId) {
        throw new Error('projectId required for pageview event');
      }
      await prisma.$executeRaw`
        INSERT INTO analytics_events (type, project_id, user_id, ip, user_agent, country, created_at)
        VALUES (${'pageview'}, ${projectId}, ${userId ?? null}, ${ip ?? null}, ${userAgent ?? null}, ${country ?? null}, NOW())
      `.catch(() => {
        console.warn('[analytics-worker] analytics_events table not present, skipping insert');
      });
      await prisma.project.update({
        where: { id: projectId },
        data: { views: { increment: 1 } },
      });
      break;
    }

    case 'download': {
      if (!projectId || !versionId) {
        throw new Error('projectId and versionId required for download event');
      }
      await prisma.$executeRaw`
        INSERT INTO analytics_events (type, project_id, version_id, user_id, ip, user_agent, country, created_at)
        VALUES (${'download'}, ${projectId}, ${versionId}, ${userId ?? null}, ${ip ?? null}, ${userAgent ?? null}, ${country ?? null}, NOW())
      `.catch((err: unknown) => {
        // C15: log rather than swallow silently; a DB outage masking as a
        // silent catch lets the analytics index diverge from reality with
        // no observability. BullMQ will retry the job; the catch keeps the
        // worker process alive.
        console.warn(
          `[analytics-worker] download insert failed (projectId=${projectId}):`,
          err instanceof Error ? err.message : err,
        );
      });
      break;
    }

    case 'install': {
      if (!projectId) {
        throw new Error('projectId required for install event');
      }
      await prisma.$executeRaw`
        INSERT INTO analytics_events (type, project_id, user_id, ip, user_agent, country, created_at)
        VALUES (${'install'}, ${projectId}, ${userId ?? null}, ${ip ?? null}, ${userAgent ?? null}, ${country ?? null}, NOW())
      `.catch((err: unknown) => {
        console.warn(
          `[analytics-worker] install insert failed (projectId=${projectId}):`,
          err instanceof Error ? err.message : err,
        );
      });
      break;
    }

    case 'aggregate': {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);

      const totals = await prisma.$queryRaw<Array<{ type: string; count: bigint }>>`
        SELECT type, COUNT(*) as count
        FROM analytics_events
        WHERE created_at >= ${yesterday} AND created_at <= ${endOfYesterday}
        GROUP BY type
      `.catch(() => [] as Array<{ type: string; count: bigint }>);

      console.log('[analytics-worker] Daily aggregation:', totals);
      break;
    }

    default:
      throw new Error(`Unknown analytics event type: ${type}`);
  }

  await job.updateProgress(100);
  return { type, projectId, processedAt: new Date().toISOString() };
}

const worker = new Worker<AnalyticsJobData>('analytics', processAnalytics, {
  connection,
  concurrency: 8,
});

worker.on('completed', (job, result) => {
  console.log(`[analytics-worker] Event ${job.id} processed:`, result.type);
});

worker.on('failed', (job, err) => {
  console.error(`[analytics-worker] Event ${job?.id} failed:`, err.message);
});

async function main() {
  try {
    await connection.ping();
    console.log('[analytics-worker] Connected to Redis');
  } catch (err) {
    console.error(
      `[analytics-worker] Failed to connect to Redis at ${REDIS_HOST}:${REDIS_PORT}: ${(err as Error).message}`,
    );
    console.error('[analytics-worker] Ensure Redis is running. Exiting.');
    process.exit(1);
  }
  console.log('[analytics-worker] Service started, listening for analytics events...');
}

main().catch((err) => {
  console.error('[analytics-worker] Startup failed:', err);
  process.exit(1);
});

let shuttingDown = false;
let shutdownWatchdog: ReturnType<typeof setTimeout> | null = null;

async function shutdown() {
  // C18: idempotent guard against a second SIGINT/SIGTERM restarting the
  // close path while the first await is in progress.
  if (shuttingDown) return;
  shuttingDown = true;
  shutdownWatchdog = setTimeout(() => {
    console.error('[analytics-worker] Shutdown timed out, forcing exit');
    process.exit(1);
  }, 25000);
  if (shutdownWatchdog && (shutdownWatchdog as any).unref) (shutdownWatchdog as any).unref();
  console.log('[analytics-worker] Shutting down...');
  try {
    await worker.close();
    await connection.quit();
    await prisma.$disconnect();
  } catch (err) {
    console.error('[analytics-worker] Shutdown error:', err instanceof Error ? err.message : err);
  } finally {
    if (shutdownWatchdog) clearTimeout(shutdownWatchdog);
    process.exit(0);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export { processAnalytics };

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

/**
 * Shared bootstrap for all BullMQ workers.
 * Extracts duplicated Redis env / SIGTERM / IORedis config (H-W5).
 *
 * Usage:
 *   import { createWorker } from './bootstrap';
 *   const { worker, connection, main } = createWorker<MyJobData>({
 *     name: 'analytics',
 *     processor: processAnalytics,
 *     concurrency: 8,
 *   });
 *   // optionally await main() after defining processor
 */

export interface CreateWorkerOptions<T> {
  name: string;
  processor: (job: Job<T>) => Promise<any>;
  concurrency?: number;
}

export interface WorkerHandle {
  worker: Worker;
  connection: IORedis;
  main: () => Promise<void>;
  shutdown: () => Promise<void>;
}

export function createWorker<T>(opts: CreateWorkerOptions<T>): WorkerHandle {
  const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
  const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
  const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

  const connection = new IORedis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    maxRetriesPerRequest: null,
    lazyConnect: true,
  });

  const worker = new Worker<T>(opts.name, opts.processor as any, {
    connection: connection as any,
    concurrency: opts.concurrency ?? 4,
  });

  worker.on('completed', (job) => {
    console.log(`[${opts.name}] Job ${job.id} completed`);
  });
  worker.on('failed', (job, err) => {
    console.error(`[${opts.name}] Job ${job?.id} failed:`, err.message);
  });
  worker.on('error', (err) => {
    console.error(`[${opts.name}] Worker error:`, err);
  });

  async function main() {
    try {
      await connection.ping();
      console.log(`[${opts.name}] Connected to Redis at ${REDIS_HOST}:${REDIS_PORT}`);
    } catch (err) {
      console.error(`[${opts.name}] Failed to connect to Redis at ${REDIS_HOST}:${REDIS_PORT}: ${(err as Error).message}`);
      console.error(`[${opts.name}] Ensure Redis is running. Exiting.`);
      process.exit(1);
    }
    console.log(`[${opts.name}] Service started, listening for ${opts.name} jobs...`);
  }

  let shuttingDown = false;

  async function shutdown() {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[${opts.name}] Shutting down...`);
    // Hard-kill watchdog: k8s terminationGracePeriod is 30s; ClamAV scans can
    // take 120s. If close hangs, force exit before SIGKILL to avoid noisy
    // restart loops.
    const watchdog = setTimeout(() => {
      console.error(`[${opts.name}] Shutdown timed out, forcing exit`);
      process.exit(1);
    }, 25000);
    // @ts-ignore - unref exists on Node Timeout
    if (typeof (watchdog as any).unref === 'function') (watchdog as any).unref();
    try {
      await worker.close();
      await connection.quit();
    } catch (err) {
      console.error(`[${opts.name}] Shutdown error:`, err instanceof Error ? err.message : err);
    } finally {
      clearTimeout(watchdog);
      process.exit(0);
    }
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return { worker, connection, main, shutdown };
}

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: true });

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Client as MinioClient } from 'minio';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9000';
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || '';
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || '';
const S3_BUCKET = process.env.S3_BUCKET || 'uploads';
const S3_REGION = process.env.S3_REGION || 'us-east-1';

const connection = new IORedis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  // M-W: lazyConnect + ping in main() (see notification-worker).
  lazyConnect: true,
});

const s3 = new S3Client({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  credentials: { accessKeyId: S3_ACCESS_KEY, secretAccessKey: S3_SECRET_KEY },
  forcePathStyle: true,
});

interface UploadJobData {
  uploadId: string;
  projectId: string;
  userId: string;
  filename: string;
  size: number;
  mimeType: string;
  objectKey: string;
  buffer?: Buffer;
  tempPath?: string;
}

async function ensureBucket(bucket: string) {
  const minio = new MinioClient({
    endPoint: S3_ENDPOINT.replace(/^https?:\/\//, '').split(':')[0],
    port: parseInt(S3_ENDPOINT.split(':').pop() || '9000', 10),
    useSSL: S3_ENDPOINT.startsWith('https'),
    accessKey: S3_ACCESS_KEY,
    secretKey: S3_SECRET_KEY,
  });

  const exists = await minio.bucketExists(bucket).catch(() => false);
  if (!exists) {
    await minio.makeBucket(bucket);
    console.log(`[upload-worker] Created bucket: ${bucket}`);
  }
}

async function processUpload(job: Job<UploadJobData>): Promise<any> {
  const { uploadId, projectId, filename, size, mimeType, objectKey, buffer, tempPath } = job.data;

  console.log(`[upload-worker] Processing upload ${uploadId}: ${filename} (${size} bytes)`);

  await job.updateProgress(10);

  let fileBuffer: Buffer;
  if (buffer) {
    fileBuffer = buffer;
  } else if (tempPath) {
    fileBuffer = await fs.readFile(tempPath);
  } else {
    throw new Error('No file data or temp path provided');
  }

  await job.updateProgress(30);

  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  console.log(`[upload-worker] Computed SHA-256: ${hash.substring(0, 16)}...`);

  await job.updateProgress(50);

  await ensureBucket(S3_BUCKET);

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: objectKey,
      Body: fileBuffer,
      ContentType: mimeType,
      Metadata: {
        'upload-id': uploadId,
        'project-id': projectId,
        sha256: hash,
        'original-filename': filename,
      },
    }),
  );

  await job.updateProgress(80);

  if (tempPath) {
    await fs.unlink(tempPath).catch(() => {});
  }

  await job.updateProgress(100);

  const fileUrl = `${S3_ENDPOINT}/${S3_BUCKET}/${objectKey}`;

  console.log(`[upload-worker] Upload ${uploadId} completed: ${fileUrl}`);

  return {
    uploadId,
    objectKey,
    fileUrl,
    size,
    hash: `sha256:${hash}`,
    bucket: S3_BUCKET,
  };
}

const worker = new Worker<UploadJobData>('uploads', processUpload, {
  connection,
  concurrency: 4,
});

worker.on('completed', (job, result) => {
  console.log(`[upload-worker] Job ${job.id} completed:`, result.fileUrl);
});

worker.on('failed', (job, err) => {
  console.error(`[upload-worker] Job ${job?.id} failed:`, err.message);
});

worker.on('error', (err) => {
  console.error('[upload-worker] Worker error:', err);
});

async function main() {
  try {
    await connection.ping();
    console.log('[upload-worker] Connected to Redis');
  } catch (err) {
    console.error(
      `[upload-worker] Failed to connect to Redis at ${REDIS_HOST}:${REDIS_PORT}: ${(err as Error).message}`,
    );
    console.error('[upload-worker] Ensure Redis is running. Exiting.');
    process.exit(1);
  }
  console.log('[upload-worker] Service started, listening for upload jobs...');
}

main().catch((err) => {
  console.error('[upload-worker] Startup failed:', err);
  process.exit(1);
});

let shuttingDown = false;
let shutdownWatchdog: ReturnType<typeof setTimeout> | null = null;

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  shutdownWatchdog = setTimeout(() => {
    console.error('[upload-worker] Shutdown timed out, forcing exit');
    process.exit(1);
  }, 25000);
  if (shutdownWatchdog && (shutdownWatchdog as any).unref) (shutdownWatchdog as any).unref();
  console.log('[upload-worker] Shutting down...');
  try {
    await worker.close();
    await connection.quit();
  } catch (err) {
    console.error('[upload-worker] Shutdown error:', err instanceof Error ? err.message : err);
  } finally {
    if (shutdownWatchdog) clearTimeout(shutdownWatchdog);
    process.exit(0);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export { processUpload };

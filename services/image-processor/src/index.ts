import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: true });

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9000';
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || '';
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || '';
const S3_BUCKET = process.env.S3_BUCKET || 'uploads';
const S3_PUBLIC_BUCKET = process.env.S3_PUBLIC_BUCKET || 'public';
const S3_PRIVATE_BUCKET = process.env.S3_PRIVATE_BUCKET || S3_BUCKET;
const S3_REGION = process.env.S3_REGION || 'us-east-1';

// Hard cap on decompressed input dimensions. A 50MP image is a large but
// legitimate screenshot; anything above is either a pixel-bomb DoS or an
// exotic source we don't want to process. Without this `sharp()` happily
// decompresses multi-hundred-megapixel inputs into RAM.
const MAX_INPUT_PIXELS = 50_000_000;

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

interface ImageJobData {
  sourceKey?: string;
  sourceBucket?: string;
  filename: string;
  mimeType: string;
  variants?: Array<{
    name: string;
    width: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  }>;
  userId?: string;
  // LEGACY fields kept only so an older producer's in-flight job doesn't crash
  // the worker — they're no longer produced by GalleryService. `buffer` is
  // explicitly rejected below because shipping binary through Redis is the
  // memory-blowup this fix targets.
  buffer?: Buffer;
  filePath?: string;
}

/**
 * Stream an object out of S3 and accumulate it into a Buffer. We cap the total
 * bytes read at MAX_SOURCE_BYTES so a malicious or misconfigured upload can't
 * exhaust worker RAM by streaming an "infinitely" large object; the upload
 * route already caps at 10MB so this is a second line of defense.
 */
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;

async function streamObjectToBuffer(bucket: string, key: string): Promise<Buffer> {
  const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const body = response.Body;
  if (!body || !(body instanceof Readable)) {
    throw new Error(`S3 object "${bucket}/${key}" had an unreadable body`);
  }
  const chunks: Buffer[] = [];
  let received = 0;
  for await (const chunk of body as AsyncIterable<Buffer>) {
    received += chunk.byteLength;
    if (received > MAX_SOURCE_BYTES) {
      // Cancel the read so we don't keep pulling bytes into RAM.
      body.destroy();
      throw new Error(`Source object "${key}" exceeds ${MAX_SOURCE_BYTES} bytes — refused to load`);
    }
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

const DEFAULT_VARIANTS = [
  { name: 'thumbnail', width: 64, height: 64, quality: 80, format: 'webp' as const },
  { name: 'small', width: 128, height: 128, quality: 80, format: 'webp' as const },
  { name: 'medium', width: 256, height: 256, quality: 85, format: 'webp' as const },
  { name: 'large', width: 512, height: 512, quality: 85, format: 'webp' as const },
];

async function processImage(job: Job<ImageJobData>): Promise<any> {
  const { filename, mimeType, variants = DEFAULT_VARIANTS, sourceKey, sourceBucket } = job.data;

  console.log(`[image-processor] Processing ${filename} (${mimeType})`);
  await job.updateProgress(10);

  let inputBuffer: Buffer;
  if (sourceKey) {
    // Preferred path: producer ships only the S3 coordinate, never the bytes.
    // The worker streams the object out of the PRIVATE bucket (where the
    // upload was quarantined behind virus-scan) and processes it locally.
    const bucket = sourceBucket || S3_PRIVATE_BUCKET;
    inputBuffer = await streamObjectToBuffer(bucket, sourceKey);
  } else if (job.data.filePath) {
    inputBuffer = await fs.readFile(job.data.filePath);
  } else if (job.data.buffer) {
    // Refuse the legacy inline-buffer payload: it's the memory-blowup vector
    // (large binary in the Redis job body) this worker was hardened against.
    throw new Error(
      'Inline buffer payloads are no longer accepted — pass sourceKey + sourceBucket and let the worker fetch from S3.',
    );
  } else {
    throw new Error('No image source provided');
  }

  await job.updateProgress(20);

  // B16: rely on sharp's built-in `limitInputPixels` (default 50MP) for the
  // metadata probe so a *decompression-bomb* is rejected AT the metadata
  // step, before the manual MAX_INPUT_PIXELS check ever runs. The previous
  // `limitInputPixels: false` told sharp to load any pixel count, meaning a
  // tiny-but-pathological PNG could allocate hundreds of MB in `metadata()`
  // before our own width*height check at line below had a chance to run. We
  // keep MAX_INPUT_PIXELS as a slightly tighter secondary cap (50M) that
  // takes precedence when sharp's default is bumped.
  //
  // `.rotate()` applies EXIF orientation so phone shots land upright; we do
  // NOT call `.withMetadata()` on any output variant, which would re-embed
  // the EXIF (and any GPS/lens data) into the public thumbnails.
  const metadata = await sharp(inputBuffer).rotate().metadata();
  if (
    typeof metadata.width === 'number' &&
    typeof metadata.height === 'number' &&
    metadata.width * metadata.height > MAX_INPUT_PIXELS
  ) {
    throw new Error(
      `Source image is ${metadata.width}x${metadata.height} (${metadata.width * metadata.height} px) — exceeds the ${MAX_INPUT_PIXELS} px input cap`,
    );
  }
  console.log(`[image-processor] Source: ${metadata.width}x${metadata.height} ${metadata.format}`);
  await job.updateProgress(30);

  const results: any[] = [];
  const totalVariants = variants.length;

  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    const progressBase = 30 + Math.floor((i / totalVariants) * 60);
    await job.updateProgress(progressBase);

    let pipeline = sharp(inputBuffer).rotate().resize(variant.width, variant.height, {
      fit: 'cover',
      position: 'center',
      withoutEnlargement: true,
    });

    const targetFormat = variant.format ?? 'webp';
    const targetMime =
      targetFormat === 'webp' ? 'image/webp' : targetFormat === 'png' ? 'image/png' : 'image/jpeg';

    if (targetFormat === 'webp') {
      pipeline = pipeline.webp({ quality: variant.quality ?? 80 });
    } else if (targetFormat === 'png') {
      pipeline = pipeline.png({ quality: variant.quality ?? 80 });
    } else {
      pipeline = pipeline.jpeg({ quality: variant.quality ?? 80, mozjpeg: true });
    }

    const outputBuffer = await pipeline.toBuffer();

    const baseName = path.parse(filename).name;
    const variantKey = `images/${baseName}/${variant.name}.${targetFormat}`;

    // Variants are public CDN assets (thumbnails on listing pages) — write
    // them into the PUBLIC bucket, not the quarantined private one.
    await s3.send(
      new PutObjectCommand({
        Bucket: S3_PUBLIC_BUCKET,
        Key: variantKey,
        Body: outputBuffer,
        ContentType: targetMime,
        CacheControl: 'public, max-age=31536000, immutable',
        Metadata: {
          'source-filename': filename,
          variant: variant.name,
          width: String(variant.width),
        },
      }),
    );

    results.push({
      name: variant.name,
      key: variantKey,
      url: `${S3_ENDPOINT}/${S3_PUBLIC_BUCKET}/${variantKey}`,
      width: variant.width,
      size: outputBuffer.length,
      format: targetFormat,
    });

    console.log(`[image-processor] Generated ${variant.name} (${outputBuffer.length} bytes)`);
  }

  await job.updateProgress(100);

  return {
    filename,
    source: {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
    },
    variants: results,
    processedAt: new Date().toISOString(),
  };
}

const worker = new Worker<ImageJobData>('image-process', processImage, {
  connection,
  concurrency: 2,
});

worker.on('completed', (job, result) => {
  console.log(`[image-processor] Image ${job.id} processed: ${result.variants.length} variants`);
});

worker.on('failed', (job, err) => {
  console.error(`[image-processor] Image ${job?.id} failed:`, err.message);
});

async function main() {
  try {
    await connection.ping();
    console.log('[image-processor] Connected to Redis');
  } catch (err) {
    console.error(
      `[image-processor] Failed to connect to Redis at ${REDIS_HOST}:${REDIS_PORT}: ${(err as Error).message}`,
    );
    console.error('[image-processor] Ensure Redis is running. Exiting.');
    process.exit(1);
  }
  console.log('[image-processor] Service started, listening for image processing jobs...');
}

main().catch((err) => {
  console.error('[image-processor] Startup failed:', err);
  process.exit(1);
});

let shuttingDown = false;
let shutdownWatchdog: ReturnType<typeof setTimeout> | null = null;

async function shutdown() {
  // C18: guard against double-sIGINT/SIGTERM initiating a second close path
  // while the first await is in progress; ordered: stop accepting jobs,
  // await in-flight, THEN close Redis.
  if (shuttingDown) return;
  shuttingDown = true;
  shutdownWatchdog = setTimeout(() => {
    console.error('[image-processor] Shutdown timed out, forcing exit');
    process.exit(1);
  }, 25000);
  if (shutdownWatchdog && (shutdownWatchdog as any).unref) (shutdownWatchdog as any).unref();
  console.log('[image-processor] Shutting down...');
  try {
    await worker.close();
    await connection.quit();
  } catch (err) {
    console.error('[image-processor] Shutdown error:', err instanceof Error ? err.message : err);
  } finally {
    if (shutdownWatchdog) clearTimeout(shutdownWatchdog);
    process.exit(0);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export { processImage, DEFAULT_VARIANTS };

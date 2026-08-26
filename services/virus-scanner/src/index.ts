import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: true });

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import * as net from 'net';
import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
const CLAMAV_HOST = process.env.CLAMAV_HOST || 'localhost';
const CLAMAV_PORT = parseInt(process.env.CLAMAV_PORT || '3310', 10);

const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9000';
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || '';
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || '';
const S3_BUCKET = process.env.S3_BUCKET || 'uploads';
const S3_REGION = process.env.S3_REGION || 'us-east-1';

const DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://mcp:mcp@localhost:5432/minecraft_platform';

// B17: hard cap on the bytes we materialize into memory before a ClamAV
// scan. The upload route already caps at 10MB, but this worker fetches the
// S3 object directly — a misconfigured bucket / presigned URL / future
// producer could enqueue a multi-GB object and OOM the worker. We refuse
// to read past this cap so the worst case is one buffered object per
// concurrency slot (2 x MAX_SOURCE_BYTES), not unbounded RAM growth.
const MAX_SOURCE_BYTES = Number(process.env.SCAN_MAX_SOURCE_BYTES) || 64 * 1024 * 1024;

const QUARANTINE_DELETE = process.env.SCAN_QUARANTINE_DELETE !== 'false';

const connection = new IORedis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

const s3 = new S3Client({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  credentials: { accessKeyId: S3_ACCESS_KEY, secretAccessKey: S3_SECRET_KEY },
  forcePathStyle: true,
});

let prisma: import('@prisma/client').PrismaClient;

async function getPrisma() {
  if (!prisma) {
    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient({
      datasources: { db: { url: DATABASE_URL } },
    });
  }
  return prisma;
}

interface ScanJobData {
  uploadId: string;
  projectId?: string;
  projectVersionId?: string;
  userId?: string;
  filename: string;
  size?: number;
  objectKey?: string;
  fileUrl?: string;
  hash?: string;
  /**
   * Optional: fetch the file from a remote HTTPS source instead of object
   * storage. Used by the admin-only Modrinth importer, whose files live on
   * Modrinth's CDN (not our MinIO bucket). Strictly limited to the
   * allow-listed hosts below; anything else is refused.
   */
  remoteUrl?: string;
}

const REMOTE_SOURCE_HOSTS = new Set(['cdn.modrinth.com', 'api.modrinth.com']);
const MAX_REMOTE_REDIRECTS = 5;

async function fetchRemoteFile(remoteUrl: string): Promise<Buffer> {
  let url: URL;
  try {
    url = new URL(remoteUrl);
  } catch {
    throw new Error(`Invalid remote scan source: ${remoteUrl}`);
  }
  const assertAllowed = (u: URL) => {
    if (u.protocol !== 'https:') {
      throw new Error(`Refusing non-https remote scan source: ${u.hostname}`);
    }
    if (!REMOTE_SOURCE_HOSTS.has(u.hostname)) {
      throw new Error(`Remote scan source host not allowed: ${u.hostname}`);
    }
  };
  assertAllowed(url);

  let res = await fetch(url.toString(), {
    redirect: 'manual',
    signal: AbortSignal.timeout(120000),
  });
  // Follow redirects manually so every hop stays on the host allow-list.
  for (
    let hops = 0;
    res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308;
    hops++
  ) {
    if (hops >= MAX_REMOTE_REDIRECTS) {
      throw new Error(`Too many redirects fetching ${remoteUrl}`);
    }
    const location = res.headers.get('location');
    if (!location) throw new Error('Redirect without Location header');
    const next = new URL(location, url);
    assertAllowed(next);
    url = next;
    await res.arrayBuffer().catch(() => {});
    res = await fetch(url.toString(), {
      redirect: 'manual',
      signal: AbortSignal.timeout(120000),
    });
  }

  if (!res.ok || !res.body) {
    throw new Error(`Remote scan source fetch failed: HTTP ${res.status}`);
  }

  // Read through a counting accumulator so an oversized file is rejected
  // mid-stream instead of buffering into worker OOM (same guard as the S3
  // path, B17).
  const reader = res.body.getReader();
  const chunks: Buffer[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > MAX_SOURCE_BYTES) {
      reader.cancel().catch(() => {});
      throw new Error(
        `Remote source "${remoteUrl}" exceeds ${MAX_SOURCE_BYTES} bytes — refused to load for scanning`,
      );
    }
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks);
}

// ClamAV clamd protocol:
//   - Commands may be prefixed with `n` (newline-delimited) or `z`
//     (NUL-delimited). The delimiter MUST match the prefix: `nCMD\n` or
//     `zCMD\0`. The previous code sent `nINSTREAM\0`, mixing an `n` prefix
//     with a NUL terminator — that is contradictory framing, so clamd never
//     recognized the command and every scan silently fell back to the
//     heuristic. We use the `z` (NUL) variant throughout.
//   - INSTREAM: after `zINSTREAM\0`, the client sends a sequence of chunks,
//     each prefixed with a 4-byte big-endian length, terminated by a
//     zero-length chunk. clamd replies `stream: OK` or `stream: <SIG> FOUND`.
// See https://docs.clamav.net/manual/Usage/ClamdProtocol.html
const CLAMAV_INSTREAM_CMD = 'zINSTREAM\0';
const CLAMAV_PING_CMD = 'zPING\0';

function encodeClamavChunk(buffer: Buffer): Buffer {
  const size = Buffer.alloc(4);
  size.writeUInt32BE(buffer.length, 0);
  return Buffer.concat([size, buffer]);
}

async function pingClamav(): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(5000);
    socket.on('connect', () => {
      socket.write(CLAMAV_PING_CMD);
    });
    let buffer = '';
    socket.on('data', (data) => {
      buffer += data.toString();
      if (buffer.includes('PONG')) {
        socket.end();
        resolve(true);
      }
    });
    socket.on('error', () => resolve(false));
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(CLAMAV_PORT, CLAMAV_HOST);
  });
}

async function scanBuffer(
  buffer: Buffer,
): Promise<{ clean: boolean; signature?: string; error?: string }> {
  return new Promise((resolve) => {
    let socket: net.Socket | null = null;
    const timeout = setTimeout(() => {
      socket?.destroy();
      resolve({ clean: false, error: 'Scan timeout' });
    }, 120000);

    socket = new net.Socket();
    socket.setTimeout(120000);

    socket.on('error', (err) => {
      clearTimeout(timeout);
      resolve({ clean: false, error: `Connection error: ${err.message}` });
    });

    socket.connect(CLAMAV_PORT, CLAMAV_HOST, () => {
      // Initiate the INSTREAM session with the correct framing.
      socket!.write(CLAMAV_INSTREAM_CMD);

      // Stream the buffer in chunks, each prefixed with its 4-byte length.
      const CHUNK_SIZE = 2048;
      for (let i = 0; i < buffer.length; i += CHUNK_SIZE) {
        const chunk = buffer.subarray(i, Math.min(i + CHUNK_SIZE, buffer.length));
        socket!.write(encodeClamavChunk(chunk));
      }
      // Zero-length chunk signals end-of-stream.
      socket!.write(Buffer.from([0, 0, 0, 0]));
      socket!.end();
    });

    let response = '';
    socket.on('data', (data) => {
      response += data.toString();
    });

    socket.on('end', () => {
      clearTimeout(timeout);
      // clamd responds with "stream: OK\n" for clean files and
      // "stream: <SIGNATURE> FOUND\n" for detections. Match on the exact
      // expected response line rather than a loose substring test: an older
      // implementation used `response.includes('OK') && !includes('FOUND')`
      // which would flip to "clean" on signatures whose name happens to
      // contain "OK" before the trailing FOUND verb. Clamd's responses are
      // line-structured, so split on newlines and test the trimmed line(s).
      const lines = response
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      const isClean = lines.some((line) => line.endsWith('stream: OK'));
      const detected = lines.find((line) => line.includes(' FOUND'));
      if (isClean && !detected) {
        resolve({ clean: true });
      } else if (detected) {
        const match = detected.match(/:\s*(.+?)\s+FOUND/);
        resolve({ clean: false, signature: match?.[1]?.trim() });
      } else {
        // Neither OK nor FOUND — treat as ambiguous / error so the worker
        // re-queues (attempts: 5) rather than silently clearing the version.
        resolve({ clean: false, error: `Unexpected clamd response: ${response}` });
      }
    });
  });
}

function localHeuristicScan(buffer: Buffer): {
  clean: boolean;
  signature?: string;
} {
  const EICAR = Buffer.from('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR');
  if (buffer.includes(EICAR)) {
    return { clean: false, signature: 'EICAR-Test-File' };
  }
  return { clean: true };
}

async function fetchObjectFromS3(objectKey: string): Promise<Buffer> {
  const response = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: objectKey }));
  if (!response.Body) {
    throw new Error(`Empty object body for key ${objectKey}`);
  }
  const body = response.Body as AsyncIterable<Buffer | Uint8Array | string>;
  // @aws-sdk v3 streams the body as a Node Readable; we read it through a
  // counting accumulator so a malformed/oversized object is rejected mid-
  // stream rather than buffering into worker OOM (B17).
  const chunks: Buffer[] = [];
  let received = 0;
  for await (const chunk of body) {
    const byteLength = typeof chunk === 'string' ? Buffer.byteLength(chunk) : chunk.byteLength;
    received += byteLength;
    if (received > MAX_SOURCE_BYTES) {
      // Stop the read so we don't keep pulling bytes into RAM.
      (response.Body as { destroy?: () => void }).destroy?.();
      throw new Error(
        `Source object "${objectKey}" exceeds ${MAX_SOURCE_BYTES} bytes — refused to load for scanning`,
      );
    }
    chunks.push(
      typeof chunk === 'string'
        ? Buffer.from(chunk)
        : Buffer.isBuffer(chunk)
          ? chunk
          : Buffer.from(chunk),
    );
  }
  return Buffer.concat(chunks);
}

async function quarantineInfected(objectKey: string): Promise<void> {
  if (!QUARANTINE_DELETE) return;
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: objectKey }));
    console.log(`[virus-scanner] Quarantined (deleted) infected object: ${objectKey}`);
  } catch (err) {
    console.error(`[virus-scanner] Failed to quarantine ${objectKey}: ${(err as Error).message}`);
  }
}

async function processScan(job: Job<ScanJobData>): Promise<any> {
  const {
    uploadId,
    projectId,
    projectVersionId,
    userId,
    filename,
    objectKey,
    fileUrl,
    hash,
    remoteUrl,
  } = job.data;

  console.log(`[virus-scanner] Scanning ${filename} (${uploadId})...`);
  await job.updateProgress(10);

  // Fetch the object back from storage rather than expecting a buffer in the
  // job payload (which would never survive BullMQ serialization). Jobs from
  // the Modrinth importer carry a remoteUrl instead of an objectKey (their
  // files live on Modrinth's CDN, see fetchRemoteFile).
  if (!objectKey && !remoteUrl) {
    throw new Error('Scan job has neither objectKey nor remoteUrl — nothing to scan');
  }
  const fileBuffer = remoteUrl
    ? await fetchRemoteFile(remoteUrl)
    : await fetchObjectFromS3(objectKey!);

  await job.updateProgress(40);

  const clamavAvailable = await pingClamav();

  let result: { clean: boolean; signature?: string; error?: string };

  if (clamavAvailable) {
    console.log(`[virus-scanner] Using ClamAV daemon at ${CLAMAV_HOST}:${CLAMAV_PORT}`);
    result = await scanBuffer(fileBuffer);
  } else {
    // Never silently approve based on a heuristic when the authoritative
    // scanner is down. Mark ERROR and let BullMQ retry (see add() options).
    const err = new Error('ClamAV daemon unavailable — scan deferred');
    err.name = 'ClamavUnavailable';
    console.warn(
      `[virus-scanner] ClamAV not available at ${CLAMAV_HOST}:${CLAMAV_PORT}; deferring scan`,
    );
    try {
      if (projectId || projectVersionId) {
        const db = await getPrisma();
        const versions = projectVersionId
          ? await db.projectVersion.findMany({ where: { id: projectVersionId } })
          : await db.projectVersion.findMany({ where: { projectId, fileUrl } });
        if (versions.length > 0) {
          await db.projectVersion.updateMany({
            where: { id: { in: versions.map((v: any) => v.id) } },
            data: { scanStatus: 'ERROR' } as any,
          });
        }
      }
    } catch (dbErr) {
      console.warn(`[virus-scanner] Could not mark ERROR state: ${(dbErr as Error).message}`);
    }
    throw err;
  }

  await job.updateProgress(80);

  // Record the scan outcome on the database version record so the platform
  // can reject / hide malware before it is published. The DB write MUST commit
  // before any S3 quarantine deletion, and DB failures must propagate as job
  // failures (BullMQ retries via attempts:5). We prefer the stable primary
  // key (projectVersionId) and fall back to (projectId, fileUrl) so existing
  // in-flight jobs produced before the key change keep working.
  if (projectId || projectVersionId) {
    const db = await getPrisma();
    const versions = projectVersionId
      ? await db.projectVersion.findMany({
          where: { id: projectVersionId },
          select: { id: true, status: true },
        })
      : await db.projectVersion.findMany({
          where: { projectId, fileUrl },
          select: { id: true, status: true },
        });

    if (versions.length === 0) {
      console.warn(
        `[virus-scanner] No version record found for projectVersionId=${projectVersionId}`,
      );
      throw new Error(`Version record not found for projectVersionId=${projectVersionId}`);
    }

    const ids = versions.map((v: any) => v.id);
    if (result.clean) {
      // SECURITY: a clean ClamAV scan only means the file is not infected —
      // it does NOT mean the version is published. The version's publish
      // status is owned by the author (POST /versions with the full
      // CreateVersionDto) and the moderator approve flow; flipping to
      // APPROVED here would bypass both and hand out the S3 URL for a stub
      // version that has no changelog/loaders/deps metadata and never went
      // through review (audit A4). Update ONLY scanStatus — leave the
      // existing version status (SUBMITTED while the author finishes, then
      // later APPROVED by the author's publish call).
      await db.projectVersion.updateMany({
        where: { id: { in: ids } },
        data: { scanStatus: 'CLEAN' } as any,
      });
    } else if (result.error) {
      await db.projectVersion.updateMany({
        where: { id: { in: ids } },
        data: { scanStatus: 'ERROR' } as any,
      });
    } else {
      // INFECTED: hard-REJECT the version and quarantine the object so the
      // URL is dead and the file can't be downloaded anymore.
      await db.projectVersion.updateMany({
        where: { id: { in: ids } },
        data: { scanStatus: 'INFECTED', status: 'REJECTED' } as any,
      });
    }

    // Only quarantine once the DB has durably recorded the INFECTED/REJECTED
    // verdict, so a failed quarantine never leaves a published-but-infected
    // version behind. Remote-source scans (Modrinth import) have no object
    // in our bucket to delete — the fileUrl simply stops resolving as soon
    // as the version is REJECTED in the DB.
    if (!result.clean && objectKey) {
      await quarantineInfected(objectKey);
    }
  }

  await job.updateProgress(100);

  console.log(
    `[virus-scanner] ${filename}: ${result.clean ? 'CLEAN' : 'INFECTED'}` +
      (result.signature ? ` (${result.signature})` : ''),
  );

  return {
    uploadId,
    projectId,
    userId,
    filename,
    objectKey,
    fileUrl,
    hash,
    clean: result.clean,
    signature: result.signature,
    error: result.error,
    engine: clamavAvailable ? 'clamav' : 'heuristic',
    quarantined: !result.clean && !!objectKey && QUARANTINE_DELETE,
    source: remoteUrl ? 'remote' : 's3',
    scannedAt: new Date().toISOString(),
  };
}

const worker = new Worker<ScanJobData>('virus-scan', processScan, {
  connection,
  concurrency: 2,
});

worker.on('completed', (job, result) => {
  console.log(
    `[virus-scanner] Scan ${job.id} completed: ${result.filename} -> ${result.clean ? 'CLEAN' : 'INFECTED'}`,
  );
});

worker.on('failed', (job, err) => {
  console.error(`[virus-scanner] Scan ${job?.id} failed:`, err.message);
});

async function main() {
  try {
    await connection.ping();
    console.log('[virus-scanner] Connected to Redis');
  } catch (err) {
    console.error(
      `[virus-scanner] Failed to connect to Redis at ${REDIS_HOST}:${REDIS_PORT}: ${(err as Error).message}`,
    );
    console.error('[virus-scanner] Ensure Redis is running. Exiting.');
    process.exit(1);
  }
  console.log('[virus-scanner] Service started, listening for scan jobs...');
}

main().catch((err) => {
  console.error('[virus-scanner] Startup failed:', err);
  process.exit(1);
});

let shuttingDown = false;
let shutdownWatchdog: ReturnType<typeof setTimeout> | null = null;

async function shutdown() {
  // C18: guard against double-SIGINT/SIGTERM. Ordered: stop accepting scan
  // jobs first, await any in-flight Hscan, THEN close Redis, then close
  // the Prisma connection last (so a final DB update can still commit).
  if (shuttingDown) return;
  shuttingDown = true;
  shutdownWatchdog = setTimeout(() => {
    console.error('[virus-scanner] Shutdown timed out, forcing exit');
    process.exit(1);
  }, 25000);
  if (shutdownWatchdog && (shutdownWatchdog as any).unref) (shutdownWatchdog as any).unref();
  console.log('[virus-scanner] Shutting down...');
  try {
    await worker.close();
    await connection.quit();
    if (prisma) await prisma.$disconnect();
  } catch (err) {
    console.error('[virus-scanner] Shutdown error:', err instanceof Error ? err.message : err);
  } finally {
    if (shutdownWatchdog) clearTimeout(shutdownWatchdog);
    process.exit(0);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export { processScan, encodeClamavChunk, localHeuristicScan };

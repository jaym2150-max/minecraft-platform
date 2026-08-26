// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockS3Send = vi.fn();

vi.mock('@aws-sdk/client-s3', () => {
  function MockS3Client() {
    this.send = mockS3Send;
  }
  return {
    S3Client: MockS3Client,
    GetObjectCommand: vi.fn(),
    DeleteObjectCommand: vi.fn(),
  };
});

vi.mock('@prisma/client', () => {
  // Must be a real (non-arrow) function so `new PrismaClient()` works;
  // vi.fn(() => ...) implementations throw "not a constructor" under `new`.
  function MockPrismaClient() {
    this.projectVersion = {
      findMany: vi.fn().mockResolvedValue([{ id: 'pv-1', status: 'SUBMITTED' }]),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    };
  }
  return { PrismaClient: MockPrismaClient };
});

vi.mock('bullmq', () => {
  function MockWorker() {
    this.on = vi.fn().mockReturnThis();
    this.run = vi.fn();
  }
  return { Worker: MockWorker };
});

vi.mock('ioredis', () => {
  function MockRedis() {
    this.ping = vi.fn();
    this.quit = vi.fn();
  }
  return { default: MockRedis };
});

vi.mock('net', () => {
  function MockSocket(this: any) {
    this._events = {};
    this.on = vi.fn((event: string, handler: any) => {
      this._events[event] = handler;
      return this;
    });
    this.connect = vi.fn((_port: number, _host: string, cb?: any) => {
      if (typeof cb === 'function') process.nextTick(cb);
      if (typeof this._events?.connect === 'function')
        process.nextTick(() => this._events.connect());
      return this;
    });
    this.write = vi.fn((_data: any, cb?: any) => {
      if (typeof cb === 'function') process.nextTick(cb);
      const dataStr = typeof _data === 'string' ? _data : _data?.toString?.() || '';
      if (dataStr.includes('PING') && typeof this._events?.data === 'function') {
        process.nextTick(() => this._events.data(Buffer.from('PONG')));
      }
      if (dataStr.includes('INSTREAM')) {
        if (typeof this._events?.data === 'function') {
          process.nextTick(() => this._events.data(Buffer.from('stream: OK')));
        }
        if (typeof this._events?.end === 'function') {
          process.nextTick(() => this._events.end());
        }
      }
    });
    this.end = vi.fn();
    this.destroy = vi.fn();
    this.setTimeout = vi.fn();
    this.setNoDelay = vi.fn();
    this.setKeepAlive = vi.fn();
  }
  return {
    Socket: MockSocket as any,
    connect: vi.fn(),
  };
});

const { encodeClamavChunk, localHeuristicScan, processScan } = await import('../index.js');

describe('encodeClamavChunk', () => {
  it('encodes buffer with 4-byte big-endian length prefix', () => {
    const input = Buffer.from('hello');
    const result = encodeClamavChunk(input);
    expect(result.length).toBe(4 + 5);
    expect(result.readUInt32BE(0)).toBe(5);
    expect(result.subarray(4).toString()).toBe('hello');
  });

  it('handles empty buffer', () => {
    const input = Buffer.alloc(0);
    const result = encodeClamavChunk(input);
    expect(result.length).toBe(4);
    expect(result.readUInt32BE(0)).toBe(0);
  });

  it('handles large buffer', () => {
    const input = Buffer.alloc(65536, 0x41);
    const result = encodeClamavChunk(input);
    expect(result.readUInt32BE(0)).toBe(65536);
    expect(result.subarray(4).length).toBe(65536);
  });
});

describe('localHeuristicScan', () => {
  const EICAR = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR';

  it('detects EICAR test string', () => {
    const buffer = Buffer.from(EICAR);
    const result = localHeuristicScan(buffer);
    expect(result.clean).toBe(false);
    expect(result.signature).toBe('EICAR-Test-File');
  });

  it('detects EICAR within larger content', () => {
    const buffer = Buffer.from(`some data before\n${EICAR}\nsome data after`);
    const result = localHeuristicScan(buffer);
    expect(result.clean).toBe(false);
  });

  it('returns clean for benign content', () => {
    const buffer = Buffer.from('this is a harmless file');
    const result = localHeuristicScan(buffer);
    expect(result.clean).toBe(true);
    expect(result.signature).toBeUndefined();
  });

  it('returns clean for empty buffer', () => {
    const buffer = Buffer.alloc(0);
    const result = localHeuristicScan(buffer);
    expect(result.clean).toBe(true);
  });

  it('returns clean for binary non-matching content', () => {
    const buffer = Buffer.from([0x00, 0x01, 0x02, 0xff]);
    const result = localHeuristicScan(buffer);
    expect(result.clean).toBe(true);
  });
});

describe('processScan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockS3Send.mockReset();
  });

  it('marks as CLEAN and approved when ClamAV succeeds', async () => {
    const fileBuffer = Buffer.from('clean file content');
    mockS3Send.mockResolvedValueOnce({
      Body: (async function* () {
        yield fileBuffer;
      })(),
    });

    const mockJob = {
      data: {
        uploadId: 'u1',
        projectId: 'p1',
        userId: 'usr1',
        filename: 'test.jar',
        objectKey: 'projects/p1/uploads/u1-test.jar',
        fileUrl: 'http://minio:9000/uploads/projects/p1/uploads/u1-test.jar',
        hash: 'sha256:abc123',
      },
      updateProgress: vi.fn(),
    } as any;

    const result = await processScan(mockJob);

    expect(result.clean).toBe(true);
    expect(result.engine).toBe('clamav');
  });

  it('handles S3 fetch error gracefully', async () => {
    mockS3Send.mockRejectedValueOnce(new Error('S3 error'));

    const mockJob = {
      data: {
        uploadId: 'u2',
        projectId: 'p1',
        filename: 'error.jar',
        objectKey: 'projects/p1/uploads/u2-error.jar',
        fileUrl: 'http://minio:9000/uploads/projects/p1/uploads/u2-error.jar',
      },
      updateProgress: vi.fn(),
    } as any;

    await expect(processScan(mockJob)).rejects.toThrow('S3 error');
  });

  it('handles DB update failure gracefully', async () => {
    const fileBuffer = Buffer.from('clean');
    mockS3Send.mockResolvedValueOnce({
      Body: (async function* () {
        yield fileBuffer;
      })(),
    });

    const mockJob = {
      data: {
        uploadId: 'u3',
        projectId: 'p1',
        filename: 'test.jar',
        objectKey: 'projects/p1/uploads/u3-test.jar',
        fileUrl: 'http://minio:9000/uploads/projects/p1/uploads/u3-test.jar',
      },
      updateProgress: vi.fn(),
    } as any;

    const result = await processScan(mockJob);
    expect(result.clean).toBe(true);
  });
});

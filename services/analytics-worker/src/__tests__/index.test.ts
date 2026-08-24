// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = {
  $executeRaw: vi.fn(),
  $queryRaw: vi.fn(),
  project: { update: vi.fn() },
};

vi.mock('@prisma/client', () => {
  function MockPrismaClient() {
    return mockPrisma;
  }
  return { PrismaClient: MockPrismaClient };
});

vi.mock('bullmq', () => {
  function MockWorker() {
    this.on = vi.fn().mockReturnThis();
    this.run = vi.fn();
  }
  return { Worker: MockWorker, Job: vi.fn() };
});

vi.mock('ioredis', () => {
  function MockRedis() {
    this.ping = vi.fn();
    this.quit = vi.fn();
  }
  return { default: MockRedis };
});

const { processAnalytics } = await import('../index.js');

describe('processAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles pageview event by incrementing project views', async () => {
    mockPrisma.$executeRaw.mockResolvedValueOnce([]);
    mockPrisma.project.update.mockResolvedValueOnce({});

    const mockJob = {
      data: { type: 'pageview', projectId: 'p1', userId: 'u1', ip: '127.0.0.1' },
      updateProgress: vi.fn(),
    } as any;

    const result = await processAnalytics(mockJob);

    expect(result.type).toBe('pageview');
    expect(mockPrisma.$executeRaw).toHaveBeenCalled();
    expect(mockPrisma.project.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'p1' },
        data: { views: { increment: 1 } },
      }),
    );
  });

  it('handles download event', async () => {
    mockPrisma.$executeRaw.mockResolvedValueOnce([]);

    const mockJob = {
      data: {
        type: 'download',
        projectId: 'p1',
        versionId: 'v1',
        userId: 'u1',
        ip: '127.0.0.1',
      },
      updateProgress: vi.fn(),
    } as any;

    const result = await processAnalytics(mockJob);

    expect(result.type).toBe('download');
    expect(mockPrisma.$executeRaw).toHaveBeenCalled();
  });

  it('handles install event', async () => {
    mockPrisma.$executeRaw.mockResolvedValueOnce([]);

    const mockJob = {
      data: { type: 'install', projectId: 'p1' },
      updateProgress: vi.fn(),
    } as any;

    const result = await processAnalytics(mockJob);
    expect(result.type).toBe('install');
  });

  it('handles aggregate event', async () => {
    mockPrisma.$queryRaw.mockResolvedValueOnce([
      { type: 'pageview', count: 100n },
      { type: 'download', count: 50n },
    ]);

    const mockJob = {
      data: { type: 'aggregate' },
      updateProgress: vi.fn(),
    } as any;

    const result = await processAnalytics(mockJob);
    expect(result.type).toBe('aggregate');
  });

  it('throws for pageview without projectId', async () => {
    const mockJob = {
      data: { type: 'pageview' },
      updateProgress: vi.fn(),
    } as any;

    await expect(processAnalytics(mockJob)).rejects.toThrow(
      'projectId required for pageview event',
    );
  });

  it('throws for download without projectId and versionId', async () => {
    const mockJob = {
      data: { type: 'download' },
      updateProgress: vi.fn(),
    } as any;

    await expect(processAnalytics(mockJob)).rejects.toThrow(
      'projectId and versionId required for download event',
    );
  });

  it('throws for unknown event type', async () => {
    const mockJob = {
      data: { type: 'unknown' as any },
      updateProgress: vi.fn(),
    } as any;

    await expect(processAnalytics(mockJob)).rejects.toThrow(
      'Unknown analytics event type: unknown',
    );
  });

  it('handles $executeRaw failure gracefully by logging warning', async () => {
    mockPrisma.$executeRaw.mockRejectedValueOnce(new Error('table not found'));
    mockPrisma.project.update.mockResolvedValueOnce({});

    const mockJob = {
      data: { type: 'pageview', projectId: 'p1', ip: '127.0.0.1' },
      updateProgress: vi.fn(),
    } as any;

    const result = await processAnalytics(mockJob);
    expect(result.type).toBe('pageview');
  });
});

// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = {
  project: { findUnique: vi.fn(), findMany: vi.fn() },
};

const mockMeiliIndex = {
  updateSettings: vi.fn(),
  addDocuments: vi.fn(),
  deleteDocument: vi.fn(),
};

const mockMeili = {
  index: vi.fn(() => mockMeiliIndex),
};

vi.mock('@prisma/client', () => {
  function MockPrismaClient() {
    return mockPrisma;
  }
  return { PrismaClient: MockPrismaClient };
});

vi.mock('meilisearch', () => ({
  MeiliSearch: function () {
    return mockMeili;
  },
}));

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

const { indexProject, processIndex } = await import('../index.js');

describe('indexProject', () => {
  it('transforms project into search document', async () => {
    const project = {
      id: 'p1',
      title: 'Sodium',
      slug: 'sodium',
      description: 'A modern rendering engine',
      body: 'Full description here',
      authorId: 'u1',
      author: { username: 'CaffeineMC' },
      categoryId: 'c1',
      category: { id: 'c1', name: 'Performance' },
      loaders: [{ type: 'fabric' }, { type: 'forge' }],
      downloads: 1000000,
      views: 500000,
      status: 'PUBLISHED',
      featured: true,
      iconUrl: 'https://example.com/icon.png',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-06-01'),
    };

    const doc = await indexProject(project);

    expect(doc.id).toBe('p1');
    expect(doc.title).toBe('Sodium');
    expect(doc.slug).toBe('sodium');
    expect(doc.authorName).toBe('CaffeineMC');
    expect(doc.categoryName).toBe('Performance');
    expect(doc.loaders).toEqual(['fabric', 'forge']);
    expect(doc.downloads).toBe(1000000);
    expect(doc.status).toBe('PUBLISHED');
    expect(doc.featured).toBe(true);
    expect(typeof doc.createdAt).toBe('number');
    expect(typeof doc.updatedAt).toBe('number');
  });

  it('handles missing optional relations', async () => {
    const project = {
      id: 'p2',
      title: 'Minimal Mod',
      slug: 'minimal',
      description: 'A tiny mod',
      authorId: 'u1',
      loaders: [],
      downloads: 0,
      views: 0,
      status: 'DRAFT',
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const doc = await indexProject(project);

    expect(doc.authorName).toBe('');
    expect(doc.categoryName).toBe('');
    expect(doc.loaders).toEqual([]);
    expect(doc.description).toBe('A tiny mod');
    expect(doc.body).toBe('');
  });

  it('converts string loaders if not objects', async () => {
    const project = {
      id: 'p3',
      title: 'Test',
      slug: 'test',
      description: '',
      authorId: 'u1',
      loaders: ['fabric', 'quilt'],
      downloads: 0,
      views: 0,
      status: 'DRAFT',
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const doc = await indexProject(project);
    expect(doc.loaders).toEqual(['fabric', 'quilt']);
  });
});

describe('processIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('upserts a project', async () => {
    mockPrisma.project.findUnique.mockResolvedValueOnce({
      id: 'p1',
      title: 'Sodium',
      slug: 'sodium',
      description: 'A mod',
      body: 'body',
      authorId: 'u1',
      author: { username: 'CaffeineMC' },
      category: { id: 'c1', name: 'Performance' },
      loaders: [{ type: 'fabric' }],
      downloads: 100,
      views: 50,
      status: 'PUBLISHED',
      featured: false,
      iconUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockMeiliIndex.addDocuments.mockResolvedValueOnce({ taskUid: 42 });

    const mockJob = {
      data: { type: 'upsert', projectId: 'p1' },
      updateProgress: vi.fn(),
    } as any;

    const result = await processIndex(mockJob);
    expect(result.type).toBe('upsert');
    expect(result.taskUid).toBe(42);
  });

  it('upserts with provided projectData', async () => {
    mockMeiliIndex.addDocuments.mockResolvedValueOnce({ taskUid: 43 });

    const mockJob = {
      data: {
        type: 'upsert',
        projectId: 'p2',
        projectData: {
          id: 'p2',
          title: 'Test',
          slug: 'test',
          description: '',
          authorId: 'u1',
          author: { username: 'testuser' },
          loaders: [],
          downloads: 0,
          views: 0,
          status: 'PUBLISHED',
          featured: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      updateProgress: vi.fn(),
    } as any;

    const result = await processIndex(mockJob);
    expect(result.type).toBe('upsert');
    expect(mockPrisma.project.findUnique).not.toHaveBeenCalled();
  });

  it('deletes a project from index', async () => {
    mockMeiliIndex.deleteDocument.mockResolvedValueOnce({ taskUid: 44 });

    const mockJob = {
      data: { type: 'delete', projectId: 'p1' },
      updateProgress: vi.fn(),
    } as any;

    const result = await processIndex(mockJob);
    expect(result.type).toBe('delete');
    expect(result.taskUid).toBe(44);
  });

  it('reindexes all published projects', async () => {
    mockPrisma.project.findMany
      .mockResolvedValueOnce([
        {
          id: 'p1',
          title: 'Mod A',
          slug: 'mod-a',
          description: '',
          body: '',
          authorId: 'u1',
          author: { username: 'user1' },
          category: null,
          loaders: [],
          downloads: 0,
          views: 0,
          status: 'PUBLISHED',
          featured: false,
          iconUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      .mockResolvedValueOnce([]);
    mockMeiliIndex.addDocuments.mockResolvedValue({ taskUid: 45 });

    const mockJob = {
      data: { type: 'reindex' },
      updateProgress: vi.fn(),
    } as any;

    const result = await processIndex(mockJob);
    expect(result.type).toBe('reindex');
    expect(result.count).toBe(1);
  });

  it('throws for unknown job type', async () => {
    const mockJob = {
      data: { type: 'invalid' as any },
      updateProgress: vi.fn(),
    } as any;

    await expect(processIndex(mockJob)).rejects.toThrow('Unknown job type: invalid');
  });

  it('throws when project not found for upsert', async () => {
    mockPrisma.project.findUnique.mockResolvedValueOnce(null);

    const mockJob = {
      data: { type: 'upsert', projectId: 'nonexistent' },
      updateProgress: vi.fn(),
    } as any;

    await expect(processIndex(mockJob)).rejects.toThrow('Project nonexistent not found');
  });
});

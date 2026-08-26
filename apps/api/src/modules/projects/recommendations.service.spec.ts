import { RecommendationsService } from './recommendations.service';

interface Project {
  id: string;
  title: string;
  slug: string;
  authorId: string;
  categoryId: string | null;
  loaders?: Array<{ type: string; versionString: string | null }>;
  tags?: any[];
}

function makePrisma(tables: {
  seeds: Project[];
  content?: Project[];
  popular?: Project[];
  hydration?: Project[];
  downloads?: any[];
}) {
  const allById = new Map<string, Project>();
  for (const arr of [
    tables.seeds,
    tables.content ?? [],
    tables.popular ?? [],
    tables.hydration ?? [],
  ]) {
    for (const p of arr) allById.set(p.id, p);
  }
  const findMany = jest.fn(async (args: any) => {
    const where = args?.where ?? {};
    const ids = where.id;
    // Content pool: where.OR present — return content candidates regardless of id shape.
    if (where.OR) {
      return tables.content ?? [];
    }
    // Seed / hydration query: where.id.in = [...]
    if (ids && typeof ids === 'object' && 'in' in ids) {
      const set = new Set<string>(ids.in);
      return Array.from(set)
        .map((id) => allById.get(id))
        .filter((p): p is Project => !!p);
    }
    // Popular fallback: where.id.notIn([seedIds]) + status PUBLISHED
    if (ids && typeof ids === 'object' && 'notIn' in ids) {
      const exclude = new Set<string>(Array.isArray(ids.notIn) ? ids.notIn : []);
      return (tables.popular ?? []).filter((p) => !exclude.has(p.id));
    }
    return tables.popular ?? [];
  });
  const download = {
    findMany: jest.fn(async () => tables.downloads ?? []),
  };
  return { project: { findMany }, download } as any;
}

describe('RecommendationsService', () => {
  it('returns empty for no seeds', async () => {
    const svc = new RecommendationsService(makePrisma({ seeds: [] }) as any);
    expect(await svc.recommend()).toEqual([]);
    expect(await svc.recommend({ seeds: [] })).toEqual([]);
  });

  it('excludes the seed project from results (fallback to popular)', async () => {
    const seed: Project = {
      id: 'a',
      title: 'A',
      slug: 'a',
      authorId: 'u1',
      categoryId: 'c1',
      loaders: [],
      tags: [],
    };
    const popular: Project = {
      id: 'b',
      title: 'B',
      slug: 'b',
      authorId: 'u2',
      categoryId: 'c2',
      loaders: [],
      tags: [],
    };
    const prisma = makePrisma({ seeds: [seed], popular: [popular] });
    const svc = new RecommendationsService(prisma as any);
    const res = await svc.recommend({ seeds: ['a'], limit: 5 });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('b');
  });

  it('boosts co-downloads and shares loader+version', async () => {
    const seed: Project = {
      id: 'a',
      title: 'A',
      slug: 'a',
      authorId: 'u1',
      categoryId: 'c1',
      loaders: [{ type: 'FABRIC', versionString: '1.21.1' }],
      tags: [],
    };
    const co: Project = {
      id: 'co1',
      title: 'CoDownload',
      slug: 'co1',
      authorId: 'u9',
      categoryId: 'c9',
      loaders: [],
      tags: [],
    };
    const sameLoad: Project = {
      id: 'sl1',
      title: 'SameLoader',
      slug: 'sl1',
      authorId: 'u9',
      categoryId: 'c9',
      loaders: [{ type: 'FABRIC', versionString: '1.21.1' }],
      tags: [],
    };
    const prisma = makePrisma({
      seeds: [seed],
      content: [co, sameLoad],
      downloads: [
        { userId: 'usr-1', ip: null, projectId: 'a' },
        { userId: 'usr-1', ip: null, projectId: 'co1' },
      ],
    });
    const svc = new RecommendationsService(prisma as any);
    const res = await svc.recommend({ seeds: ['a'], limit: 5 });
    expect(res).toHaveLength(2);
    const byId = Object.fromEntries(res.map((r) => [r.id, r]));
    expect(byId.co1.recommendationScore).toBeGreaterThan(byId.sl1.recommendationScore);
    expect(byId.sl1.recommendationReasons).toContain(
      'runs on the same loader and Minecraft version',
    );
    expect(byId.co1.recommendationReasons).toContain('frequently downloaded together');
  });

  it('falls back to popular when no co-downloads and no content signals', async () => {
    const seed: Project = {
      id: 'a',
      title: 'A',
      slug: 'a',
      authorId: 'u1',
      categoryId: null,
      loaders: [],
      tags: [],
    };
    const popular: Project = {
      id: 'p1',
      title: 'P1',
      slug: 'p1',
      authorId: 'u8',
      categoryId: null,
      loaders: [],
      tags: [],
    };
    const prisma = makePrisma({ seeds: [seed], popular: [popular] });
    const svc = new RecommendationsService(prisma as any);
    const res = await svc.recommend({ seeds: ['a'], limit: 3 });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('p1');
    expect(res[0].recommendationReasons).toContain('popular on the platform');
  });

  it('respects limit and includes reasons', async () => {
    const seed: Project = {
      id: 'a',
      title: 'A',
      slug: 'a',
      authorId: 'u1',
      categoryId: 'c1',
      loaders: [],
      tags: [],
    };
    const c1: Project = {
      id: 'x1',
      title: 'X1',
      slug: 'x1',
      authorId: 'u2',
      categoryId: 'c1',
      loaders: [],
      tags: [],
    };
    const c2: Project = {
      id: 'x2',
      title: 'X2',
      slug: 'x2',
      authorId: 'u3',
      categoryId: 'c1',
      loaders: [],
      tags: [],
    };
    const prisma = makePrisma({
      seeds: [seed],
      content: [c1, c2],
      downloads: [
        { userId: 'u', ip: null, projectId: 'a' },
        { userId: 'u', ip: null, projectId: 'x1' },
        { userId: 'u', ip: null, projectId: 'x2' },
      ],
    });
    const svc = new RecommendationsService(prisma as any);
    const res = await svc.recommend({ seeds: ['a'], limit: 1 });
    expect(res).toHaveLength(1);
    expect(res[0].recommendationReasons.length).toBeGreaterThan(0);
  });
});

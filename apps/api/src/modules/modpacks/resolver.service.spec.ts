import { ResolverService } from './resolver.service';

function mockPrisma(overrides: any = {}) {
  const base: any = {
    project: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    },
    projectVersion: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    dependency: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  };
  // shallow merge overrides
  for (const k of Object.keys(overrides)) base[k] = { ...base[k], ...overrides[k] };
  return base;
}

describe('ResolverService', () => {
  it('returns missing conflict for unknown seed', async () => {
    const prisma: any = mockPrisma({
      project: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
    });
    const svc = new ResolverService(prisma);
    const res = await svc.resolve(['nope']);
    expect(res.conflicts.some((c) => c.kind === 'MISSING')).toBe(true);
    expect(res.resolvedCount).toBe(0);
  });

  it('resolves single project with no deps', async () => {
    const prisma: any = mockPrisma();
    prisma.project.findFirst.mockResolvedValue({ id: 'p1', slug: 'sodium', title: 'Sodium' });
    prisma.project.findUnique.mockResolvedValue({ id: 'p1', slug: 'sodium', title: 'Sodium' });
    prisma.projectVersion.findMany.mockResolvedValue([
      { id: 'v1', version: '1.0.0', loaders: [{ type: 'FABRIC', versionString: '1.21.1' }] },
    ]);
    const svc = new ResolverService(prisma);
    const res = await svc.resolve(['sodium'], { gameVersion: '1.21.1', loaderType: 'FABRIC' });
    expect(res.resolvedCount).toBe(1);
    expect(res.conflicts).toHaveLength(0);
    expect(res.nodes['p1'].score).toBe(100);
  });

  it('resolves two-project chain', async () => {
    const prisma: any = mockPrisma();
    prisma.project.findFirst.mockImplementation(async (args: any) => {
      const slug = args.where?.slug ?? args.where?.OR?.[1]?.slug;
      if (slug === 'a') return { id: 'a', slug: 'a', title: 'A' };
      if (slug === 'b') return { id: 'b', slug: 'b', title: 'B' };
      return null;
    });
    prisma.project.findUnique.mockImplementation(async (args: any) => {
      if (args.where.id === 'a') return { id: 'a', slug: 'a', title: 'A' };
      if (args.where.id === 'b') return { id: 'b', slug: 'b', title: 'B' };
      return null;
    });
    prisma.projectVersion.findMany.mockImplementation(async (args: any) => {
      if (args.where.projectId === 'a' || args.where.projectId === 'b')
        return [
          {
            id: 'v-' + args.where.projectId,
            version: '1.0.0',
            loaders: [{ type: 'FABRIC', versionString: '1.21.1' }],
          },
        ];
      return [];
    });
    // a depends on b
    prisma.dependency.findMany.mockImplementation(async (args: any) => {
      if (args.where.dependentId === 'a')
        return [
          {
            id: 'd1',
            dependentId: 'a',
            requiredId: 'b',
            versionId: 'v-a',
            kind: 'REQUIRED',
            versionRange: null,
            loaderType: null,
            isRequired: true,
            isOptional: false,
          },
        ];
      return [];
    });
    const svc = new ResolverService(prisma);
    const res = await svc.resolve(['a'], { gameVersion: '1.21.1', loaderType: 'FABRIC' });
    expect(res.resolvedCount).toBe(2);
    expect(res.nodes['a'].children).toContain('b');
  });

  it('detects cycle', async () => {
    const prisma: any = mockPrisma();
    prisma.project.findFirst.mockImplementation(async (a: any) => {
      const slug = a.where.slug;
      if (slug === 'a') return { id: 'a', slug: 'a', title: 'A' };
      return null;
    });
    prisma.project.findUnique.mockImplementation(async (a: any) => {
      if (a.where.id === 'a' || a.where.id === 'b')
        return { id: a.where.id, slug: a.where.id, title: a.where.id };
      return null;
    });
    prisma.projectVersion.findMany.mockResolvedValue([
      { id: 'v', version: '1.0.0', loaders: [{ type: 'FABRIC', versionString: '1.21.1' }] },
    ]);
    prisma.dependency.findMany.mockImplementation(async (a: any) => {
      if (a.where.dependentId === 'a')
        return [
          {
            id: 'd1',
            dependentId: 'a',
            requiredId: 'b',
            versionId: 'v',
            kind: 'REQUIRED',
            versionRange: null,
            loaderType: null,
            isRequired: true,
          },
        ];
      if (a.where.dependentId === 'b')
        return [
          {
            id: 'd2',
            dependentId: 'b',
            requiredId: 'a',
            versionId: 'v',
            kind: 'REQUIRED',
            versionRange: null,
            loaderType: null,
            isRequired: true,
          },
        ];
      return [];
    });
    const svc = new ResolverService(prisma);
    const res = await svc.resolve(['a']);
    expect(res.conflicts.some((c) => c.kind === 'CYCLE')).toBe(true);
  });

  it('surfaces incompatibility', async () => {
    const prisma: any = mockPrisma();
    prisma.project.findFirst.mockResolvedValue({ id: 'a', slug: 'a', title: 'A' });
    prisma.project.findUnique.mockResolvedValue({ id: 'a', slug: 'a', title: 'A' });
    prisma.projectVersion.findMany.mockResolvedValue([{ id: 'v', version: '1.0.0', loaders: [] }]);
    prisma.dependency.findMany.mockResolvedValue([
      {
        id: 'd1',
        dependentId: 'a',
        requiredId: 'b',
        versionId: 'v',
        kind: 'INCOMPATIBLE',
        loaderType: null,
        versionRange: null,
      },
    ]);
    const svc = new ResolverService(prisma);
    const res = await svc.resolve(['a']);
    expect(res.conflicts.some((c) => c.kind === 'INCOMPATIBLE')).toBe(true);
  });

  it('versionRange mismatch produces VERSION_MISMATCH', async () => {
    const prisma: any = mockPrisma();
    prisma.project.findFirst.mockResolvedValue({ id: 'a', slug: 'a', title: 'A' });
    prisma.project.findUnique.mockImplementation(async (a: any) => {
      if (a.where.id === 'a') return { id: 'a', slug: 'a', title: 'A' };
      if (a.where.id === 'b') return { id: 'b', slug: 'b', title: 'B' };
      return null;
    });
    prisma.projectVersion.findMany.mockImplementation(async (a: any) => {
      if (a.where.projectId === 'a') return [{ id: 'va', version: '1.0.0', loaders: [] }];
      if (a.where.projectId === 'b') return [{ id: 'vb', version: '1.0.0', loaders: [] }];
      return [];
    });
    prisma.dependency.findMany.mockImplementation(async (a: any) => {
      if (a.where.dependentId === 'a')
        return [
          {
            id: 'd1',
            dependentId: 'a',
            requiredId: 'b',
            versionId: 'va',
            kind: 'REQUIRED',
            versionRange: '>=2.0.0',
            loaderType: null,
            isRequired: true,
          },
        ];
      return [];
    });
    const svc = new ResolverService(prisma);
    const res = await svc.resolve(['a']);
    expect(res.conflicts.some((c) => c.kind === 'VERSION_MISMATCH')).toBe(true);
  });

  it('scores 100 when no conflicts', async () => {
    const prisma: any = mockPrisma();
    prisma.project.findFirst.mockResolvedValue({ id: 'p1', slug: 'p1', title: 'P1' });
    prisma.project.findUnique.mockResolvedValue({ id: 'p1', slug: 'p1', title: 'P1' });
    prisma.projectVersion.findMany.mockResolvedValue([
      { id: 'v1', version: '2.0.0', loaders: [{ type: 'FABRIC', versionString: '1.21.1' }] },
    ]);
    prisma.dependency.findMany.mockResolvedValue([]);
    const svc = new ResolverService(prisma);
    const res = await svc.resolve(['p1'], { gameVersion: '1.21.1', loaderType: 'FABRIC' });
    expect(res.score).toBe(100);
  });
});

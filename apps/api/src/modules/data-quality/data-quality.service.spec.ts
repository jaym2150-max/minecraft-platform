import { DataQualityService } from './data-quality.service';

function mockPrisma(opts: any) {
  const base: any = {
    dataIssue: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    project: { findUnique: jest.fn(), findMany: jest.fn() },
    providerProject: { findMany: jest.fn() },
  };
  if (opts?.dataIssueCount)
    base.dataIssue.count.mockImplementation(async (a: any) =>
      a?.where?.status === 'OPEN' ? opts.dataIssueCount.open : opts.dataIssueCount.total,
    );
  if (opts?.dataIssueGroupBy) {
    base.dataIssue.groupBy.mockImplementation(async (a: any) => {
      if (a?.by?.includes('kind')) return opts.dataIssueGroupBy.byKind ?? [];
      if (a?.by?.includes('severity')) return opts.dataIssueGroupBy.bySeverity ?? [];
      return [];
    });
  }
  return base;
}

describe('DataQualityService.findDuplicates', () => {
  it('returns null when target slug does not exist', async () => {
    const svc = new DataQualityService(
      mockPrisma({ project: { findUnique: jest.fn().mockResolvedValue(null) } }) as any,
    );
    const res = await svc.findDuplicates('does-not-exist');
    expect(res.project).toBeNull();
  });

  it('returns scored candidates by title similarity', async () => {
    const target = { id: 'a', title: 'Sodium', slug: 'sodium' };
    const candidates = [
      { id: 'b', title: 'Sodium', slug: 'sodium-copy', downloads: 0, updatedAt: new Date() },
      { id: 'c', title: 'Lithium', slug: 'lithium', downloads: 0, updatedAt: new Date() },
    ];
    const prisma = mockPrisma({});
    prisma.project.findUnique.mockResolvedValue(target);
    prisma.project.findMany.mockResolvedValue(candidates);
    prisma.providerProject.findMany.mockResolvedValue([]);
    const svc = new DataQualityService(prisma as any);
    const res = await svc.findDuplicates('sodium');
    expect(res.candidates.length).toBeGreaterThanOrEqual(1);
    const c = res.candidates.find((x) => x.project.id === 'b');
    expect(c).toBeTruthy();
    expect(c!.score).toBeGreaterThan(0.9);
    const d = res.candidates.find((x) => x.project.id === 'c');
    expect(d).toBeFalsy();
  });
});

describe('DataQualityService.summary', () => {
  it('returns open count + byKind + bySeverity', async () => {
    const prisma = mockPrisma({
      dataIssueCount: { open: 7, total: 12 },
      dataIssueGroupBy: {
        byKind: [
          { kind: 'DUPLICATE_TITLE', _count: { _all: 3 } },
          { kind: 'MISSING_ICON', _count: { _all: 4 } },
        ],
        bySeverity: [
          { severity: 1, _count: { _all: 4 } },
          { severity: 3, _count: { _all: 3 } },
        ],
      },
    });
    const svc = new DataQualityService(prisma as any);
    const res = await svc.summary();
    expect(res.open).toBe(7);
    expect((res.byKind as any).DUPLICATE_TITLE).toBe(3);
    expect((res.bySeverity as any)['1']).toBe(4);
  });
});

describe('DataQualityService.setStatus', () => {
  it('updates status and stamps resolvedAt when RESOLVED', async () => {
    const prisma = mockPrisma({});
    prisma.dataIssue.findUnique.mockResolvedValue({ id: 'i1' });
    prisma.dataIssue.update.mockImplementation(async (args: any) => ({ id: 'i1', ...args.data }));
    const svc = new DataQualityService(prisma as any);
    const res = await svc.setStatus('i1', 'RESOLVED', 'admin-1');
    expect(res.status).toBe('RESOLVED');
    expect(prisma.dataIssue.update).toHaveBeenCalled();
  });
});

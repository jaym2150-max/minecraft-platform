import { AiService } from './ai.service';

function mockPrisma(overrides: any = {}) {
  return {
    project: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
    },
    ...overrides,
  } as any;
}

describe('AiService.parseNaturalLanguage', () => {
  it('extracts loader, version, tags', () => {
    const svc = new AiService(mockPrisma({}));
    const p = svc.parseNaturalLanguage('I want technology mods for Fabric 1.21.1');
    expect(p.loaders).toContain('FABRIC');
    expect(p.gameVersions).toContain('1.21.1');
    expect(p.categories).toContain('technology');
  });

  it('produces search without filler', () => {
    const svc = new AiService(mockPrisma({}));
    const p = svc.parseNaturalLanguage('technology mods for Fabric 1.21.1 that dont require power');
    expect(p.search).not.toMatch(/fabric/i);
    expect(p.search).not.toMatch(/1\.21\.1/);
  });
});

describe('AiService.summarizeMod', () => {
  it('returns null when not found', async () => {
    const svc = new AiService(mockPrisma({}) as any);
    expect(await svc.summarizeMod('missing')).toBeNull();
  });
  it('returns summary with bullets', async () => {
    const prisma = mockPrisma({});
    prisma.project.findFirst.mockResolvedValue({
      id: '1',
      slug: 'sodium',
      title: 'Sodium',
      description: 'Optimize rendering',
      downloads: 100,
      clientSide: true,
      serverSide: true,
      category: { name: 'optimization' },
    });
    const svc = new AiService(prisma as any);
    const r = await svc.summarizeMod('sodium');
    expect(r?.slug).toBe('sodium');
    expect(r?.bullets.length).toBeGreaterThan(0);
  });
});

describe('AiService.explainCompatibility', () => {
  it('explains missing version', async () => {
    const prisma = mockPrisma({});
    prisma.project.findFirst.mockResolvedValue({
      id: '1',
      slug: 'sodium',
      title: 'Sodium',
      loaders: [{ type: 'FABRIC', versionString: '1.20.1' }],
    });
    const svc = new AiService(prisma as any);
    const r = await svc.explainCompatibility('sodium', '1.21.1', 'FABRIC');
    expect(r?.compatible).toBe(false);
    expect(r?.reasons.join(' ')).toMatch(/1\.21\.1/);
  });
});

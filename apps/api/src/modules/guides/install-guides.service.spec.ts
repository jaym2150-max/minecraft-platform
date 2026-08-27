import { InstallGuidesService } from './install-guides.service';

function mockPrisma(opts: any) {
  const base: any = {
    project: { findUnique: jest.fn() },
    installGuideTemplate: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  if (opts?.projectFindUnique) base.project.findUnique.mockResolvedValue(opts.projectFindUnique);
  if (opts?.templates) base.installGuideTemplate.findMany.mockResolvedValue(opts.templates);
  if (opts?.fallbackTemplate)
    base.installGuideTemplate.findFirst.mockResolvedValue(opts.fallbackTemplate);
  return base;
}

describe('InstallGuidesService.renderForProject', () => {
  it('substitutes {{token}} placeholders for a Fabric project', async () => {
    const project = {
      id: 'p1',
      title: 'Sodium',
      slug: 'sodium',
      clientSide: true,
      serverSide: false,
      latestVersion: '0.5.8',
      loaders: [{ id: 1, type: 'FABRIC', versionString: '1.21.1' }],
    };
    const tpl = {
      id: 't1',
      loader: 'FABRIC',
      title: 'Install {{projectName}}',
      excerpt: 'Quick install',
      body: 'Project {{projectName}} loader {{loader}} for {{gameVersion}} file {{filename}} v{{version}}',
    };
    const svc = new InstallGuidesService(
      mockPrisma({ projectFindUnique: project, templates: [tpl] }) as any,
    );
    const res = await svc.renderForProject('p1');
    expect(res).toMatchObject({ templateId: 't1', loader: 'FABRIC' });
    expect(res!.body).toContain('Sodium');
    expect(res!.body).toContain('FABRIC');
    expect(res!.body).toContain('1.21.1');
    expect(res!.body).toContain('sodium.jar');
    expect(res!.body).toContain('0.5.8');
  });

  it('falls back to the first recommended template when no loader-specific row exists', async () => {
    const project = {
      id: 'p1',
      title: 'Lithium',
      slug: 'lithium',
      clientSide: true,
      serverSide: true,
      latestVersion: '0.13.0',
      loaders: [{ id: 1, type: 'FORGE', versionString: '1.20.4' }],
    };
    const fallback = {
      id: 't0',
      loader: 'FORGE',
      title: 'Forge install',
      excerpt: 'forge default',
      body: 'Forge body {{projectName}} {{version}}',
    };
    const svc = new InstallGuidesService(
      mockPrisma({ projectFindUnique: project, templates: [], fallbackTemplate: fallback }) as any,
    );
    const res = await svc.renderForProject('p1');
    expect(res).toMatchObject({ templateId: 't0' });
    expect(res!.body).toContain('Lithium');
    expect(res!.body).toContain('0.13.0');
  });

  it('returns null when the project does not exist', async () => {
    const svc = new InstallGuidesService(mockPrisma({ projectFindUnique: null }) as any);
    expect(await svc.renderForProject('nope')).toBeNull();
  });
});

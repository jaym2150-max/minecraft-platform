import { ModpackImportService } from './import.service';

const SAMPLE = JSON.stringify({
  format_version: 1,
  game: 'minecraft',
  version_id: '1.0.0',
  name: 'Demo Pack',
  summary: 'A demo',
  dependencies: { minecraft: '1.21.1', 'fabric-loader': '0.15.0' },
  files: [{ path: 'mods/a.jar', fileSize: 100, downloads: [] }],
});

function mockPrisma(
  opts: { projectCreate?: any; versionCreate?: any; loaderCreate?: any; mcFind?: any } = {},
) {
  const project = {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(
      opts.projectCreate
        ? async () => opts.projectCreate
        : async (args: any) => ({
            id: 'p1',
            slug: 'demo-pack-1.0.0',
            title: 'Demo Pack',
            ...(args?.data ?? {}),
          }),
    ),
  };
  const projectVersion = {
    create: jest.fn().mockImplementation(
      opts.versionCreate
        ? async () => opts.versionCreate
        : async (args: any) => ({
            id: 'v1',
            projectId: args?.data?.projectId ?? 'p1',
            ...(args?.data ?? {}),
          }),
    ),
  };
  const loader = {
    create: jest.fn().mockImplementation(
      opts.loaderCreate
        ? async () => opts.loaderCreate
        : async (args: any) => ({
            id: 'l1',
            projectId: args?.data?.projectId ?? 'p1',
            versionId: args?.data?.versionId ?? 'v1',
            ...(args?.data ?? {}),
          }),
    ),
  };
  const minecraftVersion = {
    findUnique: jest.fn().mockResolvedValue(opts.mcFind ?? { version: '1.21.1' }),
  };
  return {
    project,
    projectVersion,
    loader,
    minecraftVersion,
    providerProject: { findMany: jest.fn().mockResolvedValue([]) },
  } as any;
}

describe('ModpackImportService.createDraft', () => {
  it('persists a draft MODPACK project for the actor', async () => {
    const svc = new ModpackImportService(mockPrisma() as any);
    const r = await svc.createDraft(SAMPLE, 'actor-1');
    expect(r.rolledBack).toBe(false);
    expect(r.project.id).toBe('p1');
    expect(r.project.slug).toContain('demo-pack');
  });

  it('rolls back when rollbackOnConflicts is true and conflicts exist', async () => {
    // craft a manifest with no minecraft version
    const bad = JSON.stringify({
      format_version: 1,
      game: 'minecraft',
      version_id: '0.1',
      name: 'Bad',
      dependencies: {},
      files: [],
    });
    const svc = new ModpackImportService(mockPrisma() as any);
    const r = await svc.createDraft(bad, 'actor-1', { rollbackOnConflicts: true });
    expect(r.rolledBack).toBe(true);
    expect(r.project).toBeNull();
  });
});

import { BadRequestException } from '@nestjs/common';
import { ModpackImportService } from './import.service';

function mockPrisma(opts: any) {
  const base: any = {
    minecraftVersion: { findUnique: jest.fn() },
    providerProject: { findMany: jest.fn() },
  };
  if (opts?.mcFindUnique) base.minecraftVersion.findUnique.mockResolvedValue(opts.mcFindUnique);
  if (opts?.providerFindMany)
    base.providerProject.findMany.mockResolvedValue(opts.providerFindMany);
  return base;
}

const SAMPLE = JSON.stringify({
  format_version: 1,
  game: 'minecraft',
  version_id: '1.0.0',
  name: 'Sample Pack',
  summary: 'A test pack',
  dependencies: { minecraft: '1.21.1', 'fabric-loader': '0.15.0' },
  files: [
    {
      path: 'mods/sodium.jar',
      fileSize: 1000,
      hashes: { sha512: 'a' },
      downloads: ['https://cdn.modrinth.com/data/A/sodium.jar'],
    },
    {
      path: 'mods/lithium.jar',
      fileSize: 500,
      downloads: ['https://cdn.modrinth.com/data/B/lithium.jar'],
    },
    { path: 'overrides/README.txt', fileSize: 50, downloads: [] },
  ],
});

describe('ModpackImportService.inspect', () => {
  it('rejects non-JSON', async () => {
    const svc = new ModpackImportService(mockPrisma({}) as any);
    await expect(svc.inspect('not json')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('parses a valid manifest and reports file composition', async () => {
    const prisma = mockPrisma({
      mcFindUnique: { version: '1.21.1' },
      providerFindMany: [],
    });
    const svc = new ModpackImportService(prisma as any);
    const report = await svc.inspect(SAMPLE);
    expect(report.name).toBe('Sample Pack');
    expect(report.versionId).toBe('1.0.0');
    expect(report.minecraft).toBe('1.21.1');
    expect(report.loader).toBe('fabric-loader');
    expect(report.fileCount).toBe(3);
    expect(report.totalSize).toBe(1550);
    expect(report.byFolder['mods'].count).toBe(2);
    expect(report.byFolder['overrides'].count).toBe(1);
    expect(report.conflicts).toEqual([]);
  });

  it('flags unknown Minecraft version', async () => {
    const prisma = mockPrisma({ mcFindUnique: null, providerFindMany: [] });
    const svc = new ModpackImportService(prisma as any);
    const report = await svc.inspect(SAMPLE);
    expect(report.conflicts.find((c) => c.kind === 'UNKNOWN_MINECRAFT')).toBeTruthy();
  });

  it('flags missing loader and missing minecraft', async () => {
    const raw = JSON.stringify({
      format_version: 1,
      game: 'minecraft',
      version_id: '0.1',
      name: 'No Deps',
      dependencies: {},
      files: [],
    });
    const prisma = mockPrisma({ mcFindUnique: null, providerFindMany: [] });
    const svc = new ModpackImportService(prisma as any);
    const report = await svc.inspect(raw);
    expect(report.conflicts.find((c) => c.kind === 'MISSING_MINECRAFT')).toBeTruthy();
    expect(report.conflicts.find((c) => c.kind === 'MISSING_LOADER')).toBeTruthy();
    expect(report.conflicts.find((c) => c.kind === 'TOO_FEW_FILES')).toBeTruthy();
  });

  it('rejects bad format_version', async () => {
    const raw = JSON.stringify({
      format_version: 2,
      game: 'minecraft',
      version_id: '0.1',
      name: 'X',
      dependencies: { minecraft: '1.21.1' },
      files: [{ path: 'mods/a.jar' }],
    });
    const svc = new ModpackImportService(mockPrisma({}) as any);
    const report = await svc.inspect(raw);
    expect(report.conflicts.find((c) => c.kind === 'BAD_FORMAT')).toBeTruthy();
  });

  it('flags wrong game (non-minecraft)', async () => {
    const raw = JSON.stringify({
      format_version: 1,
      game: 'hytale',
      version_id: '1',
      name: 'Hytale',
      dependencies: { minecraft: '1.21.1' },
      files: [{ path: 'mods/a.jar' }],
    });
    const svc = new ModpackImportService(
      mockPrisma({ mcFindUnique: { version: '1.21.1' } }) as any,
    );
    const report = await svc.inspect(raw);
    expect(report.notes.some((n) => n.includes('hytale'))).toBe(true);
  });

  it('resolves files that match known provider links', async () => {
    const prisma = mockPrisma({
      mcFindUnique: { version: '1.21.1' },
      providerFindMany: [
        { projectId: 'sodium-id', externalUrl: 'https://cdn.modrinth.com/data/A/sodium.jar' },
      ],
    });
    const svc = new ModpackImportService(prisma as any);
    const report = await svc.inspect(SAMPLE);
    const sodium = report.files.find((f) => f.path.endsWith('sodium.jar'));
    expect(sodium?.resolvedProjectId).toBe('sodium-id');
  });
});

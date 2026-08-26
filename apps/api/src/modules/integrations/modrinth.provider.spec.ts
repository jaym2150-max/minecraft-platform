import {
  ModrinthProvider,
  mapProjectType,
  modrinthProjectUrl,
  LOADER_MAP,
} from './modrinth.provider';

function mockHeaders(entries: Record<string, string> = {}) {
  return {
    get: (k: string) => entries[k.toLowerCase()] ?? entries[k] ?? null,
  } as unknown as Headers;
}

function mockResponse(status: number, body: unknown, headers: Record<string, string> = {}) {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: mockHeaders(headers),
    json: async () => body,
  } as unknown as Response;
}

describe('mapProjectType', () => {
  it('maps known Modrinth types', () => {
    expect(mapProjectType('mod')).toBe('MOD');
    expect(mapProjectType('modpack')).toBe('MODPACK');
    expect(mapProjectType('resourcepack')).toBe('RESOURCE_PACK');
    expect(mapProjectType('shader')).toBe('SHADER');
    expect(mapProjectType('datapack')).toBe('DATA_PACK');
    expect(mapProjectType('plugin')).toBe('PLUGIN');
  });
  it('defaults unknown types to MOD', () => {
    expect(mapProjectType('unknown')).toBe('MOD');
    expect(mapProjectType('')).toBe('MOD');
  });
});

describe('modrinthProjectUrl', () => {
  it('builds correct canonical URLs', () => {
    expect(modrinthProjectUrl('mod', 'sodium')).toBe('https://modrinth.com/mod/sodium');
    expect(modrinthProjectUrl('modpack', 'my-pack')).toBe('https://modrinth.com/modpack/my-pack');
    expect(modrinthProjectUrl('resourcepack', 'faithful')).toBe(
      'https://modrinth.com/resourcepack/faithful',
    );
  });
});

describe('LOADER_MAP', () => {
  it('covers all supported loaders', () => {
    expect(LOADER_MAP.fabric).toBe('FABRIC');
    expect(LOADER_MAP.forge).toBe('FORGE');
    expect(LOADER_MAP.neoforge).toBe('NEOFORGE');
    expect(LOADER_MAP.quilt).toBe('QUILT');
  });
});

describe('ModrinthProvider', () => {
  const noSleep = async () => {};
  const baseOpts = { minRequestIntervalMs: 0, sleep: noSleep };

  it('returns parsed JSON on 200', async () => {
    const fetchImpl = jest.fn(async () => mockResponse(200, { id: 'abc', slug: 'sodium' }));
    const p = new ModrinthProvider(undefined as any, { ...baseOpts, fetchImpl: fetchImpl as any });
    const res = await p.request('/project/sodium');
    expect(res).toEqual({ id: 'abc', slug: 'sodium' });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('returns null on 404', async () => {
    const fetchImpl = jest.fn(async () => mockResponse(404, null));
    const p = new ModrinthProvider(undefined as any, { ...baseOpts, fetchImpl: fetchImpl as any });
    expect(await p.request('/project/missing')).toBeNull();
  });

  it('retries on 500 then succeeds', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(mockResponse(500, null))
      .mockResolvedValueOnce(mockResponse(200, { ok: true }));
    const p = new ModrinthProvider(undefined as any, { ...baseOpts, fetchImpl: fetchImpl as any });
    const res = await p.request('/project/sodium');
    expect(res).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('returns null after max attempts on 500', async () => {
    const fetchImpl = jest.fn(async () => mockResponse(500, null));
    const p = new ModrinthProvider(undefined as any, { ...baseOpts, fetchImpl: fetchImpl as any });
    expect(await p.request('/project/sodium')).toBeNull();
    expect(fetchImpl).toHaveBeenCalledTimes(4);
  });

  it('sends User-Agent header', async () => {
    const fetchImpl = jest.fn(async (_url: string, opts: any) => {
      expect(opts.headers['User-Agent']).toMatch(/minecraft-platform/);
      return mockResponse(200, {});
    });
    const p = new ModrinthProvider(undefined as any, { ...baseOpts, fetchImpl: fetchImpl as any });
    await p.request('/project/sodium');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('normalizes a full project payload via getProject', async () => {
    const payload = {
      id: 'A1B2',
      slug: 'create',
      title: 'Create',
      description: 'A tech mod',
      body: '<p>Hello <strong>world</strong> this is a much longer description that easily exceeds forty characters</p>',
      icon_url: 'https://example.com/icon.png',
      source_url: 'https://github.com/example/create',
      discord_url: null,
      issues_url: 'https://github.com/example/create/issues',
      project_type: 'mod',
      categories: ['technology'],
      downloads: 12345,
      follows: 999,
      client_side: 'required',
      server_side: 'required',
      license: { id: 'mit', name: 'MIT' },
      author: 'simibubi',
      updated: '2024-01-01T00:00:00.000Z',
    };
    const fetchImpl = jest.fn(async () => mockResponse(200, payload));
    const p = new ModrinthProvider(undefined as any, { ...baseOpts, fetchImpl: fetchImpl as any });
    const normalized = await p.getProject('create');
    expect(normalized).toMatchObject({
      externalId: 'A1B2',
      slug: 'create',
      title: 'Create',
      projectType: 'MOD',
      licenseShortId: 'MIT',
      downloads: 12345,
    });
    // HTML body should be converted to markdown
    expect(normalized?.body).toContain('**world**');
  });

  it('normalizes versions via getVersions', async () => {
    const versionsPayload = [
      {
        id: 'v1',
        version_number: '1.2.3',
        changelog: 'fixes',
        game_versions: ['1.20.1'],
        loaders: ['fabric'],
        downloads: 100,
        date_published: '2024-01-02T00:00:00.000Z',
        files: [
          {
            url: 'https://cdn.modrinth.com/file.jar',
            filename: 'create-1.2.3.jar',
            primary: true,
            size: 123456,
            hashes: { sha1: 'abc', sha512: 'def' },
          },
        ],
      },
    ];
    const fetchImpl = jest.fn(async () => mockResponse(200, versionsPayload));
    const p = new ModrinthProvider(undefined as any, { ...baseOpts, fetchImpl: fetchImpl as any });
    const versions = await p.getVersions('A1B2');
    expect(versions).toHaveLength(1);
    expect(versions[0]).toMatchObject({
      externalId: 'v1',
      versionNumber: '1.2.3',
      gameVersions: ['1.20.1'],
      loaders: ['fabric'],
    });
    expect(versions[0].files[0].sha512).toBe('def');
  });

  it('searchTop maps hits', async () => {
    const searchPayload = {
      hits: [
        {
          project_id: 'X1',
          slug: 'sodium',
          title: 'Sodium',
          description: 'Optimize',
          date_modified: '2024-02-01T00:00:00.000Z',
          downloads: 5000,
          follows: 100,
          icon_url: null,
          project_type: 'mod',
        },
      ],
    };
    const fetchImpl = jest.fn(async () => mockResponse(200, searchPayload));
    const p = new ModrinthProvider(undefined as any, { ...baseOpts, fetchImpl: fetchImpl as any });
    const hits = await p.searchTop('mod', 1);
    expect(hits).toHaveLength(1);
    expect(hits[0].slug).toBe('sodium');
    expect(hits[0].externalId).toBe('X1');
  });
});

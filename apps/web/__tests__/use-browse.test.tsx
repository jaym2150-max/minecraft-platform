import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useBrowse,
  useCategories,
  useLicenses,
  useLicense,
  type BrowseFilters,
} from '@/hooks/use-browse';
import { sdk } from '@/services/api';
import type { PaginatedResponse, Project } from '@mcp/types';
import { ProjectStatus } from '@mcp/types';

vi.mock('@/services/api', () => ({
  sdk: {
    listProjects: vi.fn(),
    listCategories: vi.fn(),
    listLicenses: vi.fn(),
    getLicense: vi.fn(),
  },
}));

const NOW_ISO = '2026-05-21T12:00:00.000Z';

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'proj_1',
    title: 'Sodium',
    slug: 'sodium',
    description: 'desc',
    downloads: 1000,
    views: 0,
    status: ProjectStatus.PUBLISHED,
    projectType: 'MOD' as any,
    featured: false,
    clientSide: true,
    serverSide: true,
    authorId: 'u',
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    ...overrides,
  } as Project;
}

function mockProjectsOnce(projects: Project[], meta?: any) {
  vi.mocked(sdk.listProjects).mockResolvedValueOnce({
    statusCode: 200,
    message: 'OK',
    timestamp: NOW_ISO,
    data: projects,
    meta: meta ?? {
      page: 1,
      limit: 20,
      total: projects.length,
      totalPages: 1,
      hasMore: false,
      nextCursor: null,
    },
  } as PaginatedResponse<Project>);
}

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

const DEFAULT_FILTERS: BrowseFilters = {
  search: '',
  sort: 'downloads',
  projectTypes: [],
  categories: [],
  loaders: [],
  environments: [],
  licenseIds: [],
  gameVersions: [],
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('useBrowse', () => {
  it('starts in loading state', async () => {
    vi.mocked(sdk.listProjects).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useBrowse({ filters: DEFAULT_FILTERS }), {
      wrapper: makeWrapper(),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.items).toEqual([]);
  });

  it('loads and maps projects on mount', async () => {
    mockProjectsOnce([makeProject({ id: 'p1' }), makeProject({ id: 'p2', slug: 'lithium' })]);

    const { result } = renderHook(() => useBrowse({ filters: DEFAULT_FILTERS }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0]).toMatchObject({ id: 'p1', slug: 'sodium', downloads: 1000 });
    expect(result.current.total).toBe(2);
    expect(result.current.hasMore).toBe(false);
  });

  it('passes search filter to SDK', async () => {
    mockProjectsOnce([makeProject()]);

    const { result } = renderHook(
      () => useBrowse({ filters: { ...DEFAULT_FILTERS, search: 'sodium' } }),
      {
        wrapper: makeWrapper(),
      },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(sdk.listProjects).toHaveBeenCalled();
    const call = vi.mocked(sdk.listProjects).mock.calls[0][0] as any;
    expect(call.search).toBe('sodium');
  });

  it('passes sort selection to SDK', async () => {
    mockProjectsOnce([makeProject()]);

    const { result } = renderHook(
      () => useBrowse({ filters: { ...DEFAULT_FILTERS, sort: 'newest' } }),
      {
        wrapper: makeWrapper(),
      },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    const call = vi.mocked(sdk.listProjects).mock.calls[0][0] as any;
    expect(call.sort).toBe('createdAt');
  });

  it('reports error when SDK call fails', async () => {
    vi.mocked(sdk.listProjects).mockRejectedValueOnce(new Error('Network down'));

    const { result } = renderHook(() => useBrowse({ filters: DEFAULT_FILTERS }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
  });

  it('supports fetchNextPage when nextCursor returned', async () => {
    mockProjectsOnce([makeProject({ id: 'p1' })], {
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 2,
      hasMore: true,
      nextCursor: 'cursor_2',
    });

    const { result } = renderHook(() => useBrowse({ filters: DEFAULT_FILTERS }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasMore).toBe(true);

    mockProjectsOnce([makeProject({ id: 'p2', slug: 'lithium' })], {
      page: 2,
      limit: 20,
      total: 2,
      totalPages: 2,
      hasMore: false,
      nextCursor: null,
    });

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.items).toHaveLength(2));
    expect(result.current.items[1].id).toBe('p2');
  });

  it('returns merged multi-category results from a single server request', async () => {
    // The backend ORs categories server-side, so the hook issues ONE
    // listProjects call (not a per-category fan-out any more) and expects
    // every project matching c1 OR c2 in that single response.
    mockProjectsOnce([makeProject({ id: 'a' }), makeProject({ id: 'b', slug: 'b' })], {
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
      hasMore: false,
      nextCursor: null,
    });

    const { result } = renderHook(
      () => useBrowse({ filters: { ...DEFAULT_FILTERS, categories: ['c1', 'c2'] } }),
      {
        wrapper: makeWrapper(),
      },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items.map((i) => i.id).sort()).toEqual(['a', 'b']);
    expect(result.current.hasMore).toBe(false);
  });
});

describe('useCategories', () => {
  it('returns categories from SDK', async () => {
    vi.mocked(sdk.listCategories).mockResolvedValueOnce({
      data: [{ id: 'c1', name: 'Performance', slug: 'performance', order: 1, createdAt: NOW_ISO }],
      statusCode: 200,
      message: 'OK',
      timestamp: NOW_ISO,
    } as any);

    const { result } = renderHook(() => useCategories(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].name).toBe('Performance');
  });

  it('returns empty array when no data', async () => {
    vi.mocked(sdk.listCategories).mockResolvedValueOnce({ data: [] } as any);

    const { result } = renderHook(() => useCategories(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe('useLicenses', () => {
  it('returns licenses from SDK', async () => {
    vi.mocked(sdk.listLicenses).mockResolvedValueOnce({
      data: [{ id: 'l1', shortId: 'MIT', name: 'MIT License', type: 'PERMISSIVE', featured: true }],
      statusCode: 200,
      message: 'OK',
      timestamp: NOW_ISO,
    } as any);

    const { result } = renderHook(() => useLicenses(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0].shortId).toBe('MIT');
  });
});

describe('useLicense', () => {
  it('does not fetch when shortId is undefined', () => {
    const { result } = renderHook(() => useLicense(undefined), { wrapper: makeWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(sdk.getLicense).not.toHaveBeenCalled();
  });

  it('fetches when shortId is provided', async () => {
    vi.mocked(sdk.getLicense).mockResolvedValueOnce({
      data: {
        id: 'l1',
        shortId: 'MIT',
        name: 'MIT License',
        type: 'PERMISSIVE',
        featured: true,
        createdAt: NOW_ISO,
        updatedAt: NOW_ISO,
      },
      statusCode: 200,
      message: 'OK',
      timestamp: NOW_ISO,
    } as any);

    const { result } = renderHook(() => useLicense('MIT'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.shortId).toBe('MIT');
  });

  it('returns null on error', async () => {
    vi.mocked(sdk.getLicense).mockRejectedValueOnce(new Error('not found'));

    const { result } = renderHook(() => useLicense('BAD'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data ?? null).toBeNull();
  });
});

import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useMods, LOADERS, SORT_OPTIONS, MINECRAFT_VERSIONS_FALLBACK } from '@/hooks/use-mods';
import type { Project, Category, PaginatedResponse } from '@mcp/types';
import { ProjectStatus } from '@mcp/types';
import { sdk } from '@/services/api';

vi.mock('@/services/api', () => ({
  sdk: {
    listProjects: vi.fn(),
    listCategories: vi.fn(),
  },
}));

const NOW_ISO = '2026-05-21T12:00:00.000Z';

function makeProject(
  overrides?: Partial<Project> & { loaders?: string[]; category?: { name: string } },
): Project & { loaders?: string[]; category?: { name: string } } {
  return {
    id: 'proj_1',
    title: 'Sodium',
    slug: 'sodium',
    description: 'A modern rendering engine',
    downloads: 15000,
    views: 45000,
    status: ProjectStatus.PUBLISHED,
    featured: false,
    clientSide: true,
    serverSide: true,
    authorId: 'user_1',
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    author: { username: 'jellysquid', avatarUrl: 'https://example.com/avatar.png' },
    ...overrides,
  };
}

function makeCategory(overrides?: Partial<Category>): Category {
  return {
    id: 'cat_1',
    name: 'Performance',
    slug: 'performance',
    description: 'Performance mods',
    order: 1,
    createdAt: NOW_ISO,
    ...overrides,
  };
}

function mockListProjects(projects: Project[], meta?: PaginatedResponse<Project>['meta']) {
  vi.mocked(sdk.listProjects).mockResolvedValueOnce({
    statusCode: 200,
    message: 'OK',
    data: projects,
    timestamp: NOW_ISO,
    meta: meta ?? {
      page: 1,
      limit: 12,
      total: projects.length,
      totalPages: Math.ceil(projects.length / 12) || 1,
    },
  } as PaginatedResponse<Project>);
}

function mockListCategories(categories: Category[]) {
  vi.mocked(sdk.listCategories).mockResolvedValueOnce({
    statusCode: 200,
    message: 'OK',
    data: categories,
    timestamp: NOW_ISO,
  });
}

function setupMocks(
  projects: Project[] = [],
  meta?: PaginatedResponse<Project>['meta'],
  categories?: Category[],
) {
  mockListCategories(
    categories ?? [
      makeCategory({ id: 'cat_1', name: 'Performance', slug: 'performance' }),
      makeCategory({ id: 'cat_2', name: 'Technology', slug: 'technology' }),
    ],
  );
  mockListProjects(projects, meta);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('useMods', () => {
  it('exports correct constants', () => {
    expect(LOADERS[0]).toMatchObject({ value: '', label: 'All Loaders' });
    expect(LOADERS.length).toBeGreaterThan(1);
    expect(SORT_OPTIONS.length).toBeGreaterThan(1);
    expect(MINECRAFT_VERSIONS_FALLBACK.length).toBeGreaterThan(0);
  });

  it('starts in loading state', () => {
    vi.mocked(sdk.listProjects).mockReturnValue(new Promise(() => {}));
    vi.mocked(sdk.listCategories).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useMods());

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.mods).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('loads and maps projects on mount', async () => {
    setupMocks([
      makeProject({ id: '1', title: 'Sodium' }),
      makeProject({ id: '2', title: 'Lithium' }),
    ]);

    const { result } = renderHook(() => useMods());

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });

    expect(result.current.mods).toHaveLength(2);
    expect(result.current.mods[0]).toMatchObject({
      id: '1',
      title: 'Sodium',
      slug: 'sodium',
      downloads: 15000,
      author: { username: 'jellysquid' },
    });
  }, 10000);

  it('maps category and loaders from API response', async () => {
    setupMocks([
      makeProject({
        id: '1',
        category: { name: 'Performance' },
        loaders: ['FABRIC', 'QUILT'],
      }),
    ]);

    const { result } = renderHook(() => useMods());

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });

    expect(result.current.mods[0].categoryName).toBe('Performance');
    expect(result.current.mods[0].loaders).toEqual(['FABRIC', 'QUILT']);
  }, 10000);

  it('derives categories from listCategories response', async () => {
    setupMocks([]);

    const { result } = renderHook(() => useMods());

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });

    expect(result.current.categories).toEqual(['Performance', 'Technology']);
  }, 10000);

  it('sets error when SDK call fails', async () => {
    vi.mocked(sdk.listCategories).mockRejectedValueOnce(new Error('Failed to load categories'));
    vi.mocked(sdk.listProjects).mockRejectedValueOnce(new Error('Failed to load mods'));

    const { result } = renderHook(() => useMods());

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });

    expect(result.current.error).toBe('Failed to load mods');
    expect(result.current.mods).toEqual([]);
  }, 10000);

  it('refetches data when refetch is called', async () => {
    setupMocks([makeProject({ id: '1', title: 'Sodium', downloads: 1000 })]);

    const { result } = renderHook(() => useMods());

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });
    expect(result.current.mods[0].downloads).toBe(1000);

    mockListProjects([makeProject({ id: '1', title: 'Sodium', downloads: 2000 })]);
    await act(async () => {
      result.current.refetch();
    });

    await waitFor(
      () => {
        expect(result.current.mods[0].downloads).toBe(2000);
      },
      { timeout: 5000 },
    );
  }, 15000);

  it('setFilter updates filters state', async () => {
    setupMocks([makeProject({ id: '1' })]);

    const { result } = renderHook(() => useMods());

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });

    await act(async () => {
      result.current.setFilter('category', 'Performance');
    });

    expect(result.current.filters.category).toBe('Performance');
  }, 10000);

  it('clearFilters resets all filters', async () => {
    setupMocks([makeProject({ id: '1' })]);

    const { result } = renderHook(() => useMods());

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });

    await act(async () => {
      result.current.setFilter('category', 'Performance');
      result.current.setFilter('loader', 'FABRIC');
    });

    expect(result.current.filters.category).toBe('Performance');
    expect(result.current.filters.loader).toBe('FABRIC');

    await act(async () => {
      result.current.clearFilters();
    });

    expect(result.current.filters.category).toBe('');
    expect(result.current.filters.loader).toBe('');
    expect(result.current.page).toBe(1);
  }, 10000);

  it('setPage updates page state', async () => {
    setupMocks([makeProject({ id: '1' })]);

    const { result } = renderHook(() => useMods());

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });
    expect(result.current.page).toBe(1);

    await act(async () => {
      result.current.setPage(2);
    });

    expect(result.current.page).toBe(2);
  }, 10000);

  it('handles null data gracefully', async () => {
    mockListCategories([]);
    vi.mocked(sdk.listProjects).mockResolvedValueOnce({
      statusCode: 200,
      message: 'OK',
      data: null as any,
      meta: { page: 1, limit: 12, total: 0, totalPages: 1 },
      timestamp: NOW_ISO,
    } as PaginatedResponse<Project>);

    const { result } = renderHook(() => useMods());

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });

    expect(result.current.mods).toEqual([]);
    expect(result.current.total).toBe(0);
  }, 10000);

  it('handles undefined data gracefully', async () => {
    mockListCategories([]);
    vi.mocked(sdk.listProjects).mockResolvedValueOnce({
      statusCode: 200,
      message: 'OK',
      data: undefined as any,
      meta: { page: 1, limit: 12, total: 0, totalPages: 1 },
      timestamp: NOW_ISO,
    } as PaginatedResponse<Project>);

    const { result } = renderHook(() => useMods());

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });

    expect(result.current.mods).toEqual([]);
  }, 10000);

  it('defaults missing author to Unknown', async () => {
    setupMocks([
      makeProject({
        id: '1',
        author: undefined as unknown as { username: string; avatarUrl?: string },
      }),
    ]);

    const { result } = renderHook(() => useMods());

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });

    expect(result.current.mods[0].author).toEqual({ username: 'Unknown' });
  }, 10000);

  it('defaults missing loaders to empty array', async () => {
    setupMocks([makeProject({ id: '1', loaders: undefined as unknown as string[] })]);

    const { result } = renderHook(() => useMods());

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });

    expect(result.current.mods[0].loaders).toEqual([]);
  }, 10000);

  it('derives total and totalPages from meta', async () => {
    setupMocks([makeProject({ id: '1' })], { page: 1, limit: 12, total: 50, totalPages: 5 });

    const { result } = renderHook(() => useMods());

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });

    expect(result.current.total).toBe(50);
    expect(result.current.totalPages).toBe(5);
  }, 10000);
});

import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useUser } from '@/hooks/use-user';
import type { Project, PaginatedResponse } from '@mcp/types';
import { ProjectStatus } from '@mcp/types';
import { sdk } from '@/services/api';

// ── Mock the SDK ──

vi.mock('@/services/api', () => ({
  sdk: {
    getUser: vi.fn(),
    listProjects: vi.fn(),
  },
}));

// ── Static test data ──

const NOW_ISO = '2026-05-21T12:00:00.000Z';

function makeUser(overrides?: Record<string, unknown>) {
  return {
    id: 'user_1',
    username: 'jellysquid',
    displayName: 'JellySquid',
    avatarUrl: 'https://example.com/avatar.png',
    bio: 'Performance mod developer',
    role: 'developer',
    projectCount: 3,
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    ...overrides,
  };
}

function makeProject(
  overrides?: Partial<Project> & Record<string, unknown>,
): Project & Record<string, unknown> {
  return {
    id: 'proj_1',
    title: 'Sodium',
    slug: 'sodium',
    description: 'A modern rendering engine',
    iconUrl: 'https://example.com/sodium.png',
    downloads: 15000,
    views: 45000,
    status: ProjectStatus.PUBLISHED,
    featured: false,
    clientSide: true,
    serverSide: true,
    authorId: 'user_1',
    author: { username: 'jellysquid', avatarUrl: 'https://example.com/avatar.png' },
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    latestVersion: '1.0.0',
    category: { name: 'Performance' },
    loaders: ['fabric', 'forge'],
    ...overrides,
  };
}

function mockGetUser(user: Record<string, unknown>) {
  vi.mocked(sdk.getUser).mockResolvedValueOnce({
    statusCode: 200,
    message: 'OK',
    data: user,
    timestamp: NOW_ISO,
  } as any);
}

function mockGetUserError(err: any) {
  vi.mocked(sdk.getUser).mockRejectedValueOnce(err);
}

function mockListProjects(projects: Project[]) {
  vi.mocked(sdk.listProjects).mockResolvedValueOnce({
    statusCode: 200,
    message: 'OK',
    data: projects,
    timestamp: NOW_ISO,
  } as PaginatedResponse<Project>);
}

function mockListProjectsError() {
  vi.mocked(sdk.listProjects).mockRejectedValueOnce(new Error('Failed to load projects'));
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('useUser', () => {
  // ── Loading state ──

  it('starts in loading state', () => {
    vi.mocked(sdk.getUser).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useUser('jellysquid'));

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.notFound).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.projects).toEqual([]);
  });

  // ── Loads user profile and projects on mount ──

  it('loads user profile and projects on mount', async () => {
    const user = makeUser();
    mockGetUser(user);
    mockListProjects([makeProject()]);

    const { result } = renderHook(() => useUser('jellysquid'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(sdk.getUser).toHaveBeenCalledWith('jellysquid');
    expect(sdk.listProjects).toHaveBeenCalledWith({
      limit: 100,
      sort: 'downloads',
      author: 'user_1',
    });
    expect(result.current.user).not.toBeNull();
    expect(result.current.projects).toHaveLength(1);
  });

  // ── Maps user fields correctly ──

  it('maps user fields correctly', async () => {
    const user = makeUser();
    mockGetUser(user);
    mockListProjects([]);

    const { result } = renderHook(() => useUser('jellysquid'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toMatchObject({
      id: 'user_1',
      username: 'jellysquid',
      displayName: 'JellySquid',
      avatarUrl: 'https://example.com/avatar.png',
      bio: 'Performance mod developer',
      role: 'developer',
      createdAt: NOW_ISO,
      updatedAt: NOW_ISO,
    });
  });

  // ── Computes totalDownloads from project downloads ──

  it('computes totalDownloads from project downloads', async () => {
    mockGetUser(makeUser());
    mockListProjects([
      makeProject({ id: '1', downloads: 15000 }),
      makeProject({ id: '2', downloads: 8000 }),
      makeProject({ id: '3', downloads: 500 }),
    ]);

    const { result } = renderHook(() => useUser('jellysquid'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user?.totalDownloads).toBe(23500);
    expect(result.current.user?.projectCount).toBe(3);
  });

  // ── Handles 404/not found ──

  it('sets notFound=true when getUser returns 404', async () => {
    mockGetUserError({ statusCode: 404, message: 'User not found' });

    const { result } = renderHook(() => useUser('nonexistent'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.notFound).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.user).toBeNull();
  });

  // ── Handles error state ──

  it('sets error when getUser fails with non-404 error', async () => {
    mockGetUserError(new Error('Internal server error'));

    const { result } = renderHook(() => useUser('jellysquid'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Internal server error');
    expect(result.current.notFound).toBe(false);
    expect(result.current.user).toBeNull();
  });

  // ── Handles projects fetch failure gracefully ──

  it('handles projects fetch failure gracefully', async () => {
    mockGetUser(makeUser());
    mockListProjectsError();

    const { result } = renderHook(() => useUser('jellysquid'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.username).toBe('jellysquid');
    expect(result.current.projects).toEqual([]);
    expect(result.current.user?.totalDownloads).toBe(0);
    expect(result.current.error).toBeNull();
  });

  // ── Refetch works ──

  it('refetches data when refetch is called', async () => {
    mockGetUser(makeUser({ displayName: 'Old Name' }));
    mockListProjects([makeProject({ downloads: 1000 })]);

    const { result } = renderHook(() => useUser('jellysquid'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user?.displayName).toBe('Old Name');
    expect(result.current.user?.totalDownloads).toBe(1000);

    mockGetUser(makeUser({ displayName: 'New Name' }));
    mockListProjects([makeProject({ downloads: 2000 })]);

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.user?.displayName).toBe('New Name');
      expect(result.current.user?.totalDownloads).toBe(2000);
    });
  });

  // ── Cleanup/abort on unmount ──

  it('aborts the fetch on unmount', async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    vi.mocked(sdk.getUser).mockReturnValue(new Promise(() => {}));

    const { unmount } = renderHook(() => useUser('jellysquid'));
    unmount();

    expect(abortSpy).toHaveBeenCalled();
    abortSpy.mockRestore();
  });

  // ── Handles empty projects list ──

  it('handles empty projects list', async () => {
    mockGetUser(makeUser());
    mockListProjects([]);

    const { result } = renderHook(() => useUser('jellysquid'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.projects).toEqual([]);
    expect(result.current.user?.projectCount).toBe(3);
    expect(result.current.user?.totalDownloads).toBe(0);
  });

  // ── Maps project category and loaders ──

  it('maps project category from (p as any).category?.name and loaders from (p as any).loaders', async () => {
    mockGetUser(makeUser());
    mockListProjects([
      makeProject({
        id: '1',
        title: 'Sodium',
        category: { name: 'Performance' },
        loaders: ['fabric', 'forge'],
      }),
      makeProject({
        id: '2',
        title: 'Iris',
        category: { name: 'Rendering' },
        loaders: ['fabric'],
      }),
    ]);

    const { result } = renderHook(() => useUser('jellysquid'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.projects[0]).toMatchObject({
      id: '1',
      title: 'Sodium',
      slug: 'sodium',
      description: 'A modern rendering engine',
      iconUrl: 'https://example.com/sodium.png',
      downloads: 15000,
      views: 45000,
      categoryName: 'Performance',
      loaders: ['fabric', 'forge'],
      latestVersion: '1.0.0',
      status: ProjectStatus.PUBLISHED,
    });

    expect(result.current.projects[1]).toMatchObject({
      id: '2',
      title: 'Iris',
      categoryName: 'Rendering',
      loaders: ['fabric'],
    });

    expect(result.current.projects[0].author).toEqual({
      username: 'jellysquid',
      avatarUrl: 'https://example.com/avatar.png',
    });
  });
});

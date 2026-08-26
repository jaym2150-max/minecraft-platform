import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDashboardProjects } from '@/hooks/use-dashboard';
import type { Project, PaginatedResponse } from '@mcp/types';
import { ProjectStatus } from '@mcp/types';
import { sdk } from '@/services/api';

// ── Mock the SDK ──

vi.mock('@/services/api', () => ({
  sdk: {
    listProjects: vi.fn(),
  },
}));

// ── Static test data ──
// Use fixed ISO strings so tests don't need fake timers

const TWO_DAYS_AGO = '2026-05-19T12:00:00.000Z';
const NOW_ISO = '2026-05-21T12:00:00.000Z';

function makeProject(overrides?: Partial<Project>): Project {
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
    createdAt: TWO_DAYS_AGO,
    updatedAt: TWO_DAYS_AGO,
    ...overrides,
  };
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
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('useDashboardProjects', () => {
  // ── Loading state ──

  it('starts in loading state', () => {
    vi.mocked(sdk.listProjects).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useDashboardProjects());

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.projects).toEqual([]);
    expect(result.current.stats.totalProjects).toBe(0);
  });

  // ── Success state ──

  it('loads and maps projects on mount', async () => {
    const projects = [
      makeProject({ id: '1', title: 'Sodium' }),
      makeProject({ id: '2', title: 'Lithium', status: ProjectStatus.PUBLISHED }),
      makeProject({ id: '3', title: 'DashLoader', status: ProjectStatus.DRAFT }),
    ];
    mockListProjects(projects);

    const { result } = renderHook(() => useDashboardProjects());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.projects).toHaveLength(3);
    expect(result.current.projects[0]).toMatchObject({
      id: '1',
      name: 'Sodium',
      slug: 'sodium',
      status: 'Published',
      downloads: 15000,
    });
    expect(result.current.projects[0].category).toBe('');
    expect(result.current.projects[0].loader).toBe('');
    expect(result.current.projects[0].mcVersion).toBe('');
    expect(typeof result.current.projects[0].updated).toBe('string');
  });

  // ── Stats derivation ──

  it('derives correct stats from project data', async () => {
    const projects = [
      makeProject({
        id: '1',
        title: 'Sodium',
        downloads: 15000,
        views: 45000,
        status: ProjectStatus.PUBLISHED,
      }),
      makeProject({
        id: '2',
        title: 'Lithium',
        downloads: 8000,
        views: 20000,
        status: ProjectStatus.PUBLISHED,
      }),
      makeProject({
        id: '3',
        title: 'DashLoader',
        downloads: 500,
        views: 3000,
        status: ProjectStatus.DRAFT,
      }),
    ];
    mockListProjects(projects);

    const { result } = renderHook(() => useDashboardProjects());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.stats).toEqual({
      totalProjects: 3,
      totalDownloads: 23500,
      totalViews: 68000,
      publishedCount: 2,
      draftCount: 1,
    });
  });

  it('handles empty project list', async () => {
    mockListProjects([]);

    const { result } = renderHook(() => useDashboardProjects());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.projects).toEqual([]);
    expect(result.current.stats).toEqual({
      totalProjects: 0,
      totalDownloads: 0,
      totalViews: 0,
      publishedCount: 0,
      draftCount: 0,
    });
  });

  it('handles null data gracefully', async () => {
    vi.mocked(sdk.listProjects).mockResolvedValueOnce({
      statusCode: 200,
      message: 'OK',
      data: null,
      timestamp: NOW_ISO,
    } as unknown as PaginatedResponse<Project>);

    const { result } = renderHook(() => useDashboardProjects());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.projects).toEqual([]);
    expect(result.current.stats.totalProjects).toBe(0);
  });

  // ── Error state ──

  it('sets error when SDK call fails', async () => {
    mockListProjectsError();

    const { result } = renderHook(() => useDashboardProjects());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Failed to load projects');
    expect(result.current.projects).toEqual([]);
  });

  // ── Refetch ──

  it('refetches data when refetch is called', async () => {
    const firstBatch = [makeProject({ id: '1', title: 'Sodium', downloads: 1000 })];
    const secondBatch = [makeProject({ id: '1', title: 'Sodium', downloads: 2000 })];

    mockListProjects(firstBatch);
    const { result } = renderHook(() => useDashboardProjects());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats.totalDownloads).toBe(1000);

    mockListProjects(secondBatch);
    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.stats.totalDownloads).toBe(2000);
    });
  });

  it('re-fetches and updates data after refetch', async () => {
    mockListProjects([]);
    const { result } = renderHook(() => useDashboardProjects());

    await waitFor(() => expect(result.current.loading).toBe(false));

    mockListProjects([makeProject({ id: '1' })]);
    result.current.refetch();

    await waitFor(() => {
      expect(result.current.projects).toHaveLength(1);
    });
    expect(result.current.loading).toBe(false);
  });

  // ── Status normalization ──

  it('normalizes various status formats', async () => {
    const projects = [
      makeProject({ id: '1', title: 'Published', status: ProjectStatus.PUBLISHED }),
      makeProject({ id: '2', title: 'Draft', status: ProjectStatus.DRAFT }),
      makeProject({ id: '3', title: 'Archived', status: ProjectStatus.ARCHIVED }),
      makeProject({ id: '4', title: 'Submitted', status: ProjectStatus.SUBMITTED }),
      makeProject({ id: '5', title: 'Rejected', status: ProjectStatus.REJECTED }),
    ];
    mockListProjects(projects);

    const { result } = renderHook(() => useDashboardProjects());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const statuses = result.current.projects.map((p) => p.status);
    expect(statuses).toContain('Published');
    expect(statuses).toContain('Draft');
    expect(statuses).toContain('Archived');
    expect(statuses.filter((s) => s === 'Archived')).toHaveLength(3);
  });

  // ── Cleanup on unmount ──

  it('aborts the fetch on unmount', async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    vi.mocked(sdk.listProjects).mockReturnValue(new Promise(() => {}));

    const { unmount } = renderHook(() => useDashboardProjects());
    unmount();

    expect(abortSpy).toHaveBeenCalled();
    abortSpy.mockRestore();
  });

  // ── Calls SDK with correct params ──

  it('calls listProjects with the expected query', async () => {
    mockListProjects([]);
    renderHook(() => useDashboardProjects());

    await waitFor(() => {
      expect(sdk.listProjects).toHaveBeenCalledWith({
        limit: 100,
        sort: 'updated',
      });
    });
  });

  // ── timeAgo formatting (uses relative dates, no fake timers needed) ──

  it('formats updatedAt as a relative time string', async () => {
    const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString();
    const fiveMinAgo = new Date(Date.now() - 300000).toISOString();
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

    const projects = [
      makeProject({ updatedAt: twoDaysAgo }),
      makeProject({ id: '2', title: 'New', updatedAt: fiveMinAgo }),
      makeProject({ id: '3', title: 'Recent', updatedAt: oneHourAgo }),
    ];
    mockListProjects(projects);

    const { result } = renderHook(() => useDashboardProjects());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.projects[0].updated).toBe('2d ago');
    expect(result.current.projects[1].updated).toBe('5m ago');
    expect(result.current.projects[2].updated).toBe('1h ago');
  });

  it('shows "just now" for very recent updates', async () => {
    const projects = [makeProject({ updatedAt: new Date(Date.now() - 10000).toISOString() })];
    mockListProjects(projects);

    const { result } = renderHook(() => useDashboardProjects());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.projects[0].updated).toBe('just now');
  });

  it('shows "recently" when updatedAt is missing', async () => {
    const projects = [makeProject({ updatedAt: undefined as unknown as string })];
    mockListProjects(projects);

    const { result } = renderHook(() => useDashboardProjects());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.projects[0].updated).toBe('recently');
  });

  // ── Multiple projects — published/draft counts ──

  it('correctly counts published vs draft projects', async () => {
    const projects = [
      makeProject({ id: '1', status: ProjectStatus.PUBLISHED }),
      makeProject({ id: '2', status: ProjectStatus.PUBLISHED }),
      makeProject({ id: '3', status: ProjectStatus.PUBLISHED }),
      makeProject({ id: '4', status: ProjectStatus.DRAFT }),
      makeProject({ id: '5', status: ProjectStatus.DRAFT }),
    ];
    mockListProjects(projects);

    const { result } = renderHook(() => useDashboardProjects());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.stats.publishedCount).toBe(3);
    expect(result.current.stats.draftCount).toBe(2);
    expect(result.current.stats.totalProjects).toBe(5);
  });

  // ── Missing downloads/views default to 0 ──

  it('defaults missing downloads/views to 0', async () => {
    const projects = [
      makeProject({
        downloads: undefined as unknown as number,
        views: undefined as unknown as number,
      }),
    ];
    mockListProjects(projects);

    const { result } = renderHook(() => useDashboardProjects());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.stats.totalDownloads).toBe(0);
    expect(result.current.stats.totalViews).toBe(0);
  });
});

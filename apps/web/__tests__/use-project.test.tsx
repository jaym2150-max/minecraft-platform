import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useProject } from '@/hooks/use-project';
import type { Project, ProjectVersion, DependencyInfo, TeamMemberInfo } from '@mcp/types';
import { VersionStatus, LoaderType } from '@mcp/types';
import { sdk } from '@/services/api';

// ── Mock the SDK ──

vi.mock('@/services/api', () => ({
  sdk: {
    getProject: vi.fn(),
    getProjectVersions: vi.fn(),
    getProjectDependencies: vi.fn(),
    getProjectTeam: vi.fn(),
    getProjectRelated: vi.fn(),
  },
}));

// ── Static test data ──

const NOW_ISO = '2026-05-21T12:00:00.000Z';

function makeProject(
  overrides?: Partial<Project> & Record<string, any>,
): Project & Record<string, any> {
  return {
    id: 'proj_1',
    title: 'Sodium',
    slug: 'sodium',
    description: 'A modern rendering engine',
    body: 'Long description here',
    downloads: 15000,
    views: 45000,
    status: 'PUBLISHED' as any,
    featured: false,
    clientSide: true,
    serverSide: true,
    authorId: 'user_1',
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    author: { username: 'jellysquid', avatarUrl: 'https://img.test/avatar.png' },
    category: { name: 'Performance' },
    loaders: ['FABRIC', 'FORGE'],
    ...overrides,
  };
}

function makeVersion(
  overrides?: Partial<ProjectVersion> & Record<string, any>,
): ProjectVersion & Record<string, any> {
  return {
    id: 'ver_1',
    version: '1.0.0',
    changelog: 'Initial release',
    fileUrl: 'https://files.test/sodium-1.0.0.jar',
    fileSize: 1024,
    hash: 'abc123',
    downloads: 5000,
    status: VersionStatus.APPROVED,
    projectId: 'proj_1',
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    loaders: [LoaderType.FABRIC],
    minecraftVersion: '1.20.4',
    ...overrides,
  };
}

function makeDependency(overrides?: Partial<DependencyInfo>): DependencyInfo {
  return {
    id: 'dep_1',
    name: 'Fabric API',
    slug: 'fabric-api',
    required: true,
    ...overrides,
  };
}

function makeTeamMember(overrides?: Partial<TeamMemberInfo>): TeamMemberInfo {
  return {
    id: 'tm_1',
    name: 'jellysquid',
    role: 'Owner',
    avatarUrl: 'https://img.test/avatar.png',
    ...overrides,
  };
}

function mockGetProject(project: any) {
  vi.mocked(sdk.getProject).mockResolvedValueOnce({ data: project } as any);
}

function mockGetProjectError(err: any) {
  vi.mocked(sdk.getProject).mockRejectedValueOnce(err);
}

function mockGetProjectVersions(versions: any[]) {
  vi.mocked(sdk.getProjectVersions).mockResolvedValueOnce({ data: versions } as any);
}

function mockGetProjectDependencies(deps: any[]) {
  vi.mocked(sdk.getProjectDependencies).mockResolvedValueOnce({ data: deps } as any);
}

function mockGetProjectTeam(team: any[]) {
  vi.mocked(sdk.getProjectTeam).mockResolvedValueOnce({ data: team } as any);
}

function mockGetProjectRelated(related: any[]) {
  vi.mocked(sdk.getProjectRelated).mockResolvedValueOnce({ data: related } as any);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('useProject', () => {
  // ── Loading state ──

  it('starts in loading state', () => {
    vi.mocked(sdk.getProject).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useProject('sodium'));

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.notFound).toBe(false);
    expect(result.current.project).toBeNull();
    expect(result.current.versions).toEqual([]);
    expect(result.current.dependencies).toEqual([]);
    expect(result.current.team).toEqual([]);
    expect(result.current.relatedMods).toEqual([]);
  });

  // ── Loads project and related data on mount ──

  it('loads project and related data on mount', async () => {
    const project = makeProject();
    const versions = [makeVersion()];
    const deps = [makeDependency()];
    const team = [makeTeamMember()];
    const related = [makeProject({ id: 'proj_2', title: 'Lithium' })];

    mockGetProject(project);
    mockGetProjectVersions(versions);
    mockGetProjectDependencies(deps);
    mockGetProjectTeam(team);
    mockGetProjectRelated(related);

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(sdk.getProject).toHaveBeenCalledWith('sodium');
    expect(sdk.getProjectVersions).toHaveBeenCalledWith('proj_1');
    expect(sdk.getProjectDependencies).toHaveBeenCalledWith('proj_1');
    expect(sdk.getProjectTeam).toHaveBeenCalledWith('proj_1');
    expect(sdk.getProjectRelated).toHaveBeenCalledWith('sodium');
    expect(result.current.project).not.toBeNull();
    expect(result.current.versions).toHaveLength(1);
    expect(result.current.dependencies).toHaveLength(1);
    expect(result.current.team).toHaveLength(1);
    expect(result.current.relatedMods).toHaveLength(1);
  });

  // ── Maps project fields correctly ──

  it('maps project fields correctly', async () => {
    const project = makeProject();
    mockGetProject(project);
    mockGetProjectVersions([]);
    mockGetProjectDependencies([]);
    mockGetProjectTeam([]);
    mockGetProjectRelated([]);

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.project).toMatchObject({
      id: 'proj_1',
      title: 'Sodium',
      slug: 'sodium',
      description: 'A modern rendering engine',
      body: 'Long description here',
      downloads: 15000,
      views: 45000,
      author: { username: 'jellysquid', avatarUrl: 'https://img.test/avatar.png' },
      createdAt: NOW_ISO,
      updatedAt: NOW_ISO,
      loaders: ['FABRIC', 'FORGE'],
    });
  });

  // ── Maps category from (p as any).category?.name ──

  it('maps category from (p as any).category?.name', async () => {
    const project = makeProject({ category: { name: 'Performance' } });
    mockGetProject(project);
    mockGetProjectVersions([]);
    mockGetProjectDependencies([]);
    mockGetProjectTeam([]);
    mockGetProjectRelated([]);

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.project!.categoryName).toBe('Performance');
  });

  it('handles missing category gracefully', async () => {
    const project = makeProject({ category: undefined });
    mockGetProject(project);
    mockGetProjectVersions([]);
    mockGetProjectDependencies([]);
    mockGetProjectTeam([]);
    mockGetProjectRelated([]);

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.project!.categoryName).toBeUndefined();
  });

  // ── Maps loaders from (p as any).loaders ──

  it('maps loaders from (p as any).loaders as strings', async () => {
    const project = makeProject({ loaders: ['FABRIC', 'FORGE'] });
    mockGetProject(project);
    mockGetProjectVersions([]);
    mockGetProjectDependencies([]);
    mockGetProjectTeam([]);
    mockGetProjectRelated([]);

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.project!.loaders).toEqual(['FABRIC', 'FORGE']);
  });

  it('maps loaders from (p as any).loaders as objects with type field', async () => {
    const project = makeProject({ loaders: [{ type: 'FABRIC' }, { type: 'FORGE' }] });
    mockGetProject(project);
    mockGetProjectVersions([]);
    mockGetProjectDependencies([]);
    mockGetProjectTeam([]);
    mockGetProjectRelated([]);

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.project!.loaders).toEqual(['FABRIC', 'FORGE']);
  });

  it('defaults loaders to empty array when not present', async () => {
    const project = makeProject({ loaders: undefined });
    mockGetProject(project);
    mockGetProjectVersions([]);
    mockGetProjectDependencies([]);
    mockGetProjectTeam([]);
    mockGetProjectRelated([]);

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.project!.loaders).toEqual([]);
  });

  // ── Handles 404 / not found ──

  it('sets notFound when sdk.getProject throws with statusCode 404', async () => {
    const err = new Error('Not found') as any;
    err.statusCode = 404;
    mockGetProjectError(err);

    const { result } = renderHook(() => useProject('nonexistent'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.notFound).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.project).toBeNull();
  });

  // ── Handles error state ──

  it('sets error when sdk.getProject fails with non-404 error', async () => {
    mockGetProjectError(new Error('Server error'));

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Server error');
    expect(result.current.notFound).toBe(false);
    expect(result.current.project).toBeNull();
  });

  it('sets error with default message when err has no message', async () => {
    mockGetProjectError({});

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Failed to load project');
    expect(result.current.notFound).toBe(false);
  });

  // ── Handles partial failures (Promise.allSettled) ──

  it('handles partial failures: versions succeed, dependencies fail', async () => {
    const project = makeProject();
    const versions = [makeVersion()];

    mockGetProject(project);
    vi.mocked(sdk.getProjectVersions).mockResolvedValueOnce({ data: versions } as any);
    vi.mocked(sdk.getProjectDependencies).mockRejectedValueOnce(new Error('Dep load failed'));
    vi.mocked(sdk.getProjectTeam).mockResolvedValueOnce({ data: [] } as any);
    vi.mocked(sdk.getProjectRelated).mockResolvedValueOnce({ data: [] } as any);

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.versions).toHaveLength(1);
    expect(result.current.dependencies).toEqual([]);
    expect(result.current.team).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('handles partial failures: team succeeds, versions and related fail', async () => {
    const project = makeProject();
    const team = [makeTeamMember()];

    mockGetProject(project);
    vi.mocked(sdk.getProjectVersions).mockRejectedValueOnce(new Error('Versions failed'));
    vi.mocked(sdk.getProjectDependencies).mockResolvedValueOnce({ data: [] } as any);
    vi.mocked(sdk.getProjectTeam).mockResolvedValueOnce({ data: team } as any);
    vi.mocked(sdk.getProjectRelated).mockRejectedValueOnce(new Error('Related failed'));

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.versions).toEqual([]);
    expect(result.current.team).toHaveLength(1);
    expect(result.current.relatedMods).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  // ── Maps versions correctly ──

  it('maps versions to VersionDisplay[] correctly', async () => {
    const project = makeProject();
    const version = makeVersion({
      id: 'ver_1',
      version: '1.0.0',
      downloads: 5000,
      status: VersionStatus.APPROVED,
      loaders: [LoaderType.FABRIC],
      minecraftVersion: '1.20.4',
    });

    mockGetProject(project);
    mockGetProjectVersions([version]);
    mockGetProjectDependencies([]);
    mockGetProjectTeam([]);
    mockGetProjectRelated([]);

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    const v = result.current.versions[0];
    expect(v.id).toBe('ver_1');
    expect(v.version).toBe('1.0.0');
    expect(v.loader).toBe('Fabric');
    expect(v.minecraft).toBe('1.20.4');
    expect(v.downloadsRaw).toBe(5000);
    expect(v.status).toBe('approved');
    expect(v.fileUrl).toBe('https://files.test/sodium-1.0.0.jar');
    expect(v.fileSize).toBe(1024);
    expect(v.changelog).toBe('Initial release');
  });

  it('maps version status SUBMITTED to pending', async () => {
    const project = makeProject();
    mockGetProject(project);
    mockGetProjectVersions([makeVersion({ status: VersionStatus.SUBMITTED })]);
    mockGetProjectDependencies([]);
    mockGetProjectTeam([]);
    mockGetProjectRelated([]);

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.versions[0].status).toBe('pending');
  });

  it('maps version status REJECTED to rejected', async () => {
    const project = makeProject();
    mockGetProject(project);
    mockGetProjectVersions([makeVersion({ status: VersionStatus.REJECTED })]);
    mockGetProjectDependencies([]);
    mockGetProjectTeam([]);
    mockGetProjectRelated([]);

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.versions[0].status).toBe('rejected');
  });

  // ── Maps dependencies correctly ──

  it('maps dependencies to DependencyDisplay[] correctly', async () => {
    const project = makeProject();
    mockGetProject(project);
    mockGetProjectVersions([]);
    mockGetProjectDependencies([
      makeDependency(),
      makeDependency({ id: 'dep_2', name: 'Sodium Extra', slug: 'sodium-extra', required: false }),
    ]);
    mockGetProjectTeam([]);
    mockGetProjectRelated([]);

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.dependencies).toHaveLength(2);
    expect(result.current.dependencies[0]).toMatchObject({
      name: 'Fabric API',
      slug: 'fabric-api',
      required: true,
    });
    expect(result.current.dependencies[1]).toMatchObject({
      name: 'Sodium Extra',
      slug: 'sodium-extra',
      required: false,
    });
  });

  // ── Maps team correctly ──

  it('maps team to TeamDisplay[] correctly', async () => {
    const project = makeProject();
    mockGetProject(project);
    mockGetProjectVersions([]);
    mockGetProjectDependencies([]);
    mockGetProjectTeam([
      makeTeamMember(),
      makeTeamMember({ id: 'tm_2', name: 'contributor', role: 'Developer', avatarUrl: undefined }),
    ]);
    mockGetProjectRelated([]);

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.team).toHaveLength(2);
    expect(result.current.team[0]).toMatchObject({
      name: 'jellysquid',
      role: 'Owner',
      avatarUrl: 'https://img.test/avatar.png',
    });
    expect(result.current.team[1]).toMatchObject({ name: 'contributor', role: 'Developer' });
    expect(result.current.team[1].avatarUrl).toBeUndefined();
  });

  // ── Maps related mods correctly and slices to 4 ──

  it('maps related mods to RelatedMod[] and slices to 4', async () => {
    const project = makeProject();
    const related = Array.from({ length: 6 }, (_, i) =>
      makeProject({ id: `r_${i}`, title: `Mod ${i}`, slug: `mod-${i}`, downloads: i * 100 }),
    );

    mockGetProject(project);
    mockGetProjectVersions([]);
    mockGetProjectDependencies([]);
    mockGetProjectTeam([]);
    mockGetProjectRelated(related);

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.relatedMods).toHaveLength(4);
    expect(result.current.relatedMods[0]).toMatchObject({
      title: 'Mod 0',
      slug: 'mod-0',
      description: 'A modern rendering engine',
      downloads: 0,
    });
  });

  // ── Refetch works ──

  it('refetches data when refetch is called', async () => {
    const project1 = makeProject({ title: 'Sodium', downloads: 1000 });
    mockGetProject(project1);
    mockGetProjectVersions([]);
    mockGetProjectDependencies([]);
    mockGetProjectTeam([]);
    mockGetProjectRelated([]);

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.project!.title).toBe('Sodium');
    expect(result.current.project!.downloads).toBe(1000);

    const project2 = makeProject({ title: 'Sodium Updated', downloads: 2000 });
    mockGetProject(project2);
    mockGetProjectVersions([]);
    mockGetProjectDependencies([]);
    mockGetProjectTeam([]);
    mockGetProjectRelated([]);

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.project!.downloads).toBe(2000);
    });
    expect(result.current.project!.title).toBe('Sodium Updated');
  });

  // ── Cleanup/abort on unmount ──

  it('aborts the fetch on unmount', async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    vi.mocked(sdk.getProject).mockReturnValue(new Promise(() => {}));

    const { unmount } = renderHook(() => useProject('sodium'));
    unmount();

    expect(abortSpy).toHaveBeenCalled();
    abortSpy.mockRestore();
  });

  // ── Handles empty/null data gracefully ──

  it('handles null project data gracefully', async () => {
    vi.mocked(sdk.getProject).mockResolvedValueOnce({ data: null } as any);

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeTruthy();
  });

  it('handles null versions data gracefully', async () => {
    const project = makeProject();
    mockGetProject(project);
    vi.mocked(sdk.getProjectVersions).mockResolvedValueOnce({ data: null } as any);
    mockGetProjectDependencies([]);
    mockGetProjectTeam([]);
    mockGetProjectRelated([]);

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.versions).toEqual([]);
  });

  it('handles null dependencies data gracefully', async () => {
    const project = makeProject();
    mockGetProject(project);
    mockGetProjectVersions([]);
    vi.mocked(sdk.getProjectDependencies).mockResolvedValueOnce(null as any);
    mockGetProjectTeam([]);
    mockGetProjectRelated([]);

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.dependencies).toEqual([]);
  });

  it('handles null team data gracefully', async () => {
    const project = makeProject();
    mockGetProject(project);
    mockGetProjectVersions([]);
    mockGetProjectDependencies([]);
    vi.mocked(sdk.getProjectTeam).mockResolvedValueOnce(null as any);
    mockGetProjectRelated([]);

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.team).toEqual([]);
  });

  it('handles null related data gracefully', async () => {
    const project = makeProject();
    mockGetProject(project);
    mockGetProjectVersions([]);
    mockGetProjectDependencies([]);
    mockGetProjectTeam([]);
    vi.mocked(sdk.getProjectRelated).mockResolvedValueOnce(null as any);

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.relatedMods).toEqual([]);
  });

  it('does not fetch when slug is empty', () => {
    const { result } = renderHook(() => useProject(''));

    expect(sdk.getProject).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(true);
  });

  it('defaults author to Unknown when author is missing', async () => {
    const project = makeProject({ author: undefined });
    mockGetProject(project);
    mockGetProjectVersions([]);
    mockGetProjectDependencies([]);
    mockGetProjectTeam([]);
    mockGetProjectRelated([]);

    const { result } = renderHook(() => useProject('sodium'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.project!.author).toEqual({ username: 'Unknown' });
  });
});

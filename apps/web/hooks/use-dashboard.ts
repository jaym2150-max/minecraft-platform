'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { sdk } from '@/services/api';
import { Project, ProjectListQuery } from '@mcp/types';
import { timeAgo } from '@mcp/utils/helpers';
import { useQuery } from '@tanstack/react-query';

export interface DashboardStats {
  totalProjects: number;
  totalDownloads: number;
  totalViews: number;
  publishedCount: number;
  draftCount: number;
}

export interface DashboardProject {
  id: string;
  name: string;
  slug: string;
  category: string;
  loader: string;
  status: 'Published' | 'Draft' | 'Archived';
  downloads: number;
  mcVersion: string;
  updated: string;
}

function mapStatus(status: string): 'Published' | 'Draft' | 'Archived' {
  if (status === 'PUBLISHED' || status === 'Published') return 'Published';
  if (status === 'DRAFT' || status === 'Draft') return 'Draft';
  return 'Archived';
}

export function useDashboardProjects() {
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalDownloads: 0,
    totalViews: 0,
    publishedCount: 0,
    draftCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchProjects = useCallback(async () => {
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    setLoading(true);
    setError(null);

    try {
      const res = await sdk.listProjects({ limit: 100, sort: 'updated' });
      if (abort.signal.aborted) return;

      const data = res.data ?? [];
      const mapped: DashboardProject[] = data.map((p: Project) => ({
        id: p.id,
        name: p.title,
        slug: p.slug,
        category: (p as any).category?.name ?? '',
        loader: ((p as any).loaders ?? [])[0] ?? '',
        status: mapStatus(p.status),
        downloads: p.downloads ?? 0,
        mcVersion: '',
        updated: p.updatedAt ? timeAgo(p.updatedAt) : 'recently',
      }));

      setProjects(mapped);
      setStats({
        totalProjects: mapped.length,
        totalDownloads: mapped.reduce((sum: number, p: DashboardProject) => sum + p.downloads, 0),
        totalViews: data.reduce((sum: number, p: Project) => sum + (p.views ?? 0), 0),
        publishedCount: mapped.filter((p: DashboardProject) => p.status === 'Published').length,
        draftCount: mapped.filter((p: DashboardProject) => p.status === 'Draft').length,
      });
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') return;
      setError('Failed to load projects');
    } finally {
      if (!abort.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    return () => abortRef.current?.abort();
  }, [fetchProjects]);

  return { projects, stats, loading, error, refetch: fetchProjects };
}

export function useUserAnalytics(period: '7d' | '30d' | '90d' | '1y' | 'all' = '30d') {
  return useQuery({
    queryKey: ['analytics', 'user', period],
    queryFn: async () => {
      const res: any = await sdk.getUserAnalytics(period);
      return res?.data ?? res;
    },
    staleTime: 30_000,
  });
}

export function useProjectAnalytics(projectId: string, period: '7d' | '30d' | '90d' | '1y' | 'all' = '30d') {
  return useQuery({
    queryKey: ['analytics', 'project', projectId, period],
    queryFn: async () => {
      if (!projectId) return null;
      const res: any = await sdk.getProjectAnalytics(projectId, period);
      return res?.data ?? res;
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

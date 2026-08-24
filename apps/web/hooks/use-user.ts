'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { sdk } from '@/services/api';
import type { Project } from '@mcp/types';
import { formatNumber, timeAgo } from '@mcp/utils/helpers';

export interface UserProjectData {
  id: string;
  title: string;
  slug: string;
  description: string;
  iconUrl?: string;
  downloads: number;
  views: number;
  author: { username: string; avatarUrl?: string };
  categoryName?: string;
  loaders: string[];
  latestVersion?: string;
  updatedAt: string;
  status: string;
}

export interface UserProfileData {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  projectCount: number;
  totalDownloads: number;
  projects: UserProjectData[];
}

export interface UseUserResult {
  user: UserProfileData | null;
  projects: UserProjectData[];
  loading: boolean;
  error: string | null;
  notFound: boolean;
  refetch: () => void;
}

export function useUser(username: string): UseUserResult {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [projects, setProjects] = useState<UserProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!username) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const userRes = await sdk.getUser(username);
      if (controller.signal.aborted) return;
      const u = userRes.data;

      let userProjects: UserProjectData[] = [];
      try {
        const projRes = await sdk.listProjects({ limit: 100, sort: 'downloads', author: u.id });
        if (controller.signal.aborted) return;
        const projList = Array.isArray(projRes.data) ? projRes.data : [];
        userProjects = projList.map((p: Project) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          description: p.description,
          iconUrl: p.iconUrl,
          downloads: p.downloads,
          views: p.views,
          author: p.author ?? { username },
          categoryName: (p as any).category?.name,
          loaders: (p as any).loaders ?? [],
          latestVersion: p.latestVersion,
          updatedAt: p.updatedAt,
          status: p.status,
        }));
      } catch {
        // Projects fetch is optional
      }

      const totalDownloads = userProjects.reduce((sum, p) => sum + p.downloads, 0);

      setUser({
        id: u.id,
        username: u.username,
        displayName: (u as any).displayName ?? undefined,
        avatarUrl: u.avatarUrl ?? undefined,
        bio: (u as any).bio ?? undefined,
        role: u.role as string,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        projectCount: (u as any).projectCount ?? userProjects.length,
        totalDownloads,
        projects: userProjects,
      });
      setProjects(userProjects);
    } catch (err: any) {
      if (controller.signal.aborted) return;
      if (err?.statusCode === 404) {
        setNotFound(true);
      } else {
        setError(err?.message || 'Failed to load user profile');
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [username]);

  useEffect(() => {
    fetchData();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchData]);

  return {
    user,
    projects,
    loading,
    error,
    notFound,
    refetch: fetchData,
  };
}

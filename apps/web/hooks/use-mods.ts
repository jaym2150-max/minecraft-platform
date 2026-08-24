'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { sdk } from '@/services/api';
import { formatNumber, timeAgo } from '@mcp/utils/helpers';
import type { Project, Category } from '@mcp/types';
import { ProjectStatus, ProjectType } from '@mcp/types';

// ── Constants ──

export const LOADERS = [
  { value: '', label: 'All Loaders' },
  { value: 'FABRIC', label: 'Fabric' },
  { value: 'FORGE', label: 'Forge' },
  { value: 'NEOFORGE', label: 'NeoForge' },
  { value: 'QUILT', label: 'Quilt' },
  { value: 'BUKKIT', label: 'Bukkit' },
  { value: 'SPIGOT', label: 'Spigot' },
  { value: 'PAPER', label: 'Paper' },
] as const;

export const SORT_OPTIONS = [
  { value: 'downloads', label: 'Most Downloads' },
  { value: 'updatedAt', label: 'Recently Updated' },
  { value: 'createdAt', label: 'Newest' },
  { value: 'title', label: 'Name (A-Z)' },
] as const;

export const PROJECT_TYPES = [
  { value: '', label: 'All Types' },
  { value: ProjectType.MOD, label: 'Mods' },
  { value: ProjectType.MODPACK, label: 'Modpacks' },
  { value: ProjectType.RESOURCE_PACK, label: 'Resource Packs' },
  { value: ProjectType.SHADER, label: 'Shaders' },
  { value: ProjectType.DATA_PACK, label: 'Data Packs' },
  { value: ProjectType.PLUGIN, label: 'Plugins' },
] as const;

export const MINECRAFT_VERSIONS_FALLBACK = [
  '1.21.4', '1.21.3', '1.21.1', '1.21',
  '1.20.6', '1.20.4', '1.20.2', '1.20.1', '1.20',
  '1.19.4', '1.19.3', '1.19.2', '1.19',
  '1.18.2', '1.18.1', '1.18',
];

// ── Types ──

export interface ModCardData {
  id: string;
  title: string;
  slug: string;
  description: string;
  iconUrl?: string;
  downloads: number;
  views: number;
  author: { username: string; avatarUrl?: string };
  categoryName?: string;
  projectType?: string;
  loaders: string[];
  latestVersion?: string;
  updatedAt: string;
  promotedUntil?: string;
}

export interface ModFilters {
  search: string;
  category: string;
  loader: string;
  projectType: string;
  mcVersion: string;
  sort: string;
}

export interface UseModsResult {
  mods: ModCardData[];
  categories: string[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  filters: ModFilters;
  setFilter: (key: keyof ModFilters, value: string) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  refetch: () => void;
  activeFilterCount: number;
}

const DEFAULT_FILTERS: ModFilters = {
  search: '',
  category: '',
  loader: '',
  projectType: '',
  mcVersion: '',
  sort: 'downloads',
};

// ── Hook ──

export function useMods(initialPage = 1): UseModsResult {
  const [mods, setMods] = useState<ModCardData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ModFilters>(DEFAULT_FILTERS);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    sdk.listCategories()
      .then((res) => {
        const cats = Array.isArray(res.data) ? res.data : [];
        setCategories(cats.map((c: Category) => c.name));
      })
      .catch(() => {
        // Fallback categories if API fails
        setCategories(['Performance', 'Technology', 'Utility', 'Graphics', 'Magic', 'Adventure', 'Storage']);
      });
  }, []);

  const setFilter = useCallback((key: keyof ModFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to page 1 on filter change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const fetchData = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const query = {
        page,
        limit: 12,
        sort: filters.sort || 'downloads',
        order: 'desc' as const,
        search: filters.search || undefined,
        category: filters.category || undefined,
        loader: filters.loader || undefined,
        projectType: filters.projectType || undefined,
        status: ProjectStatus.PUBLISHED,
      };

      const res = await sdk.listProjects(query);
      if (controller.signal.aborted) return;

      const projects = Array.isArray(res.data) ? res.data : [];
      const meta = res.meta ?? { total: projects.length, page: 1, totalPages: Math.ceil(projects.length / 12) };

      setMods(
        projects.map((p: Project) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          description: p.description,
          iconUrl: p.iconUrl,
          downloads: p.downloads,
          views: p.views,
          author: p.author ?? { username: 'Unknown' },
          loaders: (p as any).loaders ?? [],
          projectType: p.projectType as string,
          latestVersion: p.latestVersion,
          updatedAt: p.updatedAt,
          categoryName: (p as any).category?.name,
          promotedUntil: (p as any).promotedUntil,
        })),
      );
      setTotal(meta.total);
      setTotalPages(meta.totalPages);
    } catch (err: any) {
      if (controller.signal.aborted) return;
      setError(err?.message || 'Failed to load mods');
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [page, filters]);

  // Debounced fetch for search changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchData();
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchData]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.loader) count++;
    if (filters.projectType) count++;
    if (filters.mcVersion) count++;
    if (filters.sort !== DEFAULT_FILTERS.sort) count++;
    return count;
  }, [filters]);

  return {
    mods,
    categories,
    total,
    page,
    totalPages,
    loading,
    error,
    filters,
    setFilter,
    clearFilters,
    setPage,
    refetch: fetchData,
    activeFilterCount,
  };
}

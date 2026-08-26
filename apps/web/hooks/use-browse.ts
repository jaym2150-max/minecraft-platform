'use client';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';
import type {
  Category,
  License,
  LicenseListItem,
  MinecraftVersion,
  Project,
  ProjectListQuery,
} from '@mcp/types';
import { ProjectStatus } from '@mcp/types';

export interface BrowseFilters {
  search: string;
  sort: 'relevance' | 'downloads' | 'follows' | 'updated' | 'newest';
  projectTypes: string[];
  categories: string[];
  loaders: string[];
  environments: ('client' | 'server')[];
  licenseIds: string[];
  gameVersions: string[];
  /** Page number for numbered pagination (1-based). Combined with cursor paging. */
  page?: number;
}

export interface BrowseProjectItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  iconUrl?: string;
  downloads: number;
  author: { username: string; avatarUrl?: string };
  categoryName?: string;
  projectType?: string;
  loaders: string[];
  latestVersion?: string;
  updatedAt: string;
  promotedUntil?: string;
}

export interface BrowseResult {
  items: BrowseProjectItem[];
  total: number;
  nextCursor: string | null;
  hasMore: boolean;
}

const SORT_MAP: Record<BrowseFilters['sort'], string> = {
  relevance: 'relevance',
  downloads: 'downloads',
  follows: 'followers',
  updated: 'updatedAt',
  newest: 'createdAt',
};

function mapProjects(projects: Project[]): BrowseProjectItem[] {
  return projects.map((p: Project & Record<string, any>) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    iconUrl: p.iconUrl,
    downloads: p.downloads ?? 0,
    author: p.author ?? { username: 'Unknown' },
    categoryName: p.category?.name ?? (p as any).categoryName,
    projectType: (p as any).projectType ?? 'MOD',
    loaders: (p as any).loaders ?? [],
    latestVersion: p.latestVersion,
    updatedAt: p.updatedAt,
    promotedUntil: (p as any).promotedUntil,
  }));
}

function buildQuery(filters: BrowseFilters, cursor: string | null): ProjectListQuery {
  const query: ProjectListQuery = {
    limit: 20,
    sort: SORT_MAP[filters.sort] || 'downloads',
    order: 'desc',
    status: ProjectStatus.PUBLISHED,
  };

  if (filters.search.trim()) query.search = filters.search.trim();
  // Send every multi-select facet as an array — the backend ORs within a
  // facet and ANDs across facets, so the server returns exactly the right
  // set and we no longer need the client-side fan-out (which broke paging).
  if (filters.projectTypes.length) query.projectTypes = filters.projectTypes;
  if (filters.categories.length) query.categories = filters.categories;
  if (filters.loaders.length) query.loaders = filters.loaders;
  if (filters.gameVersions.length) query.gameVersions = filters.gameVersions;
  if (filters.environments.length) query.environments = filters.environments;
  if (filters.licenseIds.length) query.licenses = filters.licenseIds;

  if (cursor) query.cursor = cursor;
  // Numbered pagination: API accepts page param; page 1 = no cursor offset
  if (filters.page && filters.page > 1) query.page = filters.page;

  return query;
}

export interface UseBrowseParams {
  filters: BrowseFilters;
}

export function useBrowse({ filters }: UseBrowseParams) {
  const query = useInfiniteQuery({
    queryKey: ['browse', filters],
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam ?? null;
      const q = buildQuery(filters, cursor);

      const baseRes: any = await sdk.listProjects(q);
      const allData: Project[] = Array.isArray(baseRes?.data) ? baseRes.data : [];

      return {
        items: mapProjects(allData),
        total: baseRes?.meta?.total ?? allData.length,
        nextCursor: baseRes?.meta?.nextCursor ?? null,
        hasMore: baseRes?.meta?.hasMore ?? false,
      } satisfies BrowseResult;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 30_000,
  });

  const items = (query.data?.pages ?? []).flatMap((p) => p.items);
  const total = query.data?.pages?.[0]?.total ?? 0;
  const hasMore = query.hasNextPage ?? false;

  return {
    items,
    total,
    hasMore,
    loading: query.isLoading,
    loadingMore: query.isFetchingNextPage,
    error: query.error ? ((query.error as Error).message ?? 'Failed to load projects') : null,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res: any = await sdk.listCategories();
      return Array.isArray(res?.data) ? res.data : [];
    },
    staleTime: 5 * 60_000,
  });
}

export function useLicenses() {
  return useQuery<LicenseListItem[]>({
    queryKey: ['licenses'],
    queryFn: async () => {
      const res: any = await (sdk as any).listLicenses?.();
      return Array.isArray(res?.data) ? res.data : [];
    },
    staleTime: 5 * 60_000,
  });
}

export function useMinecraftVersions() {
  return useQuery<MinecraftVersion[]>({
    queryKey: ['minecraft-versions'],
    queryFn: async () => {
      const res: any = await sdk.listMinecraftVersions();
      return Array.isArray(res?.data) ? res.data : [];
    },
    staleTime: 30 * 60_000,
  });
}

export function useLicense(shortId: string | undefined) {
  return useQuery<License | null>({
    queryKey: ['license', shortId],
    queryFn: async () => {
      if (!shortId) return null;
      try {
        const res: any = await (sdk as any).getLicense?.(shortId);
        return res?.data ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!shortId,
    staleTime: 5 * 60_000,
  });
}

export type { Category, License };

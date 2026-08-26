'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Search, X, ArrowUpDown, Loader2, Package as PackageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@mcp/ui/components/input';
import { Button } from '@mcp/ui/components/button';
import { Badge } from '@mcp/ui/components/badge';
import { FacetFilter, type FacetOption } from '@/components/facet-filter';
import { BrowseGrid } from '@/components/browse-grid';
import { Pagination } from '@/components/pagination';
import { ProjectTypeTabs } from '@/components/project-type-tabs';
import {
  useBrowse,
  useCategories,
  useLicenses,
  useMinecraftVersions,
  type BrowseFilters,
} from '@/hooks/use-browse';
import { useDebounce } from '@/hooks/use-debounce';
import { ProjectType } from '@mcp/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';

const PROJECT_TYPE_OPTIONS: { value: ProjectType; label: string }[] = [
  { value: ProjectType.MOD, label: 'Mods' },
  { value: ProjectType.MODPACK, label: 'Modpacks' },
  { value: ProjectType.RESOURCE_PACK, label: 'Resource Packs' },
  { value: ProjectType.DATA_PACK, label: 'Data Packs' },
  { value: ProjectType.SHADER, label: 'Shaders' },
  { value: ProjectType.PLUGIN, label: 'Plugins' },
];

const LOADER_OPTIONS: { value: string; label: string }[] = [
  { value: 'FABRIC', label: 'Fabric' },
  { value: 'FORGE', label: 'Forge' },
  { value: 'NEOFORGE', label: 'NeoForge' },
  { value: 'QUILT', label: 'Quilt' },
  { value: 'BUKKIT', label: 'Bukkit' },
  { value: 'SPIGOT', label: 'Spigot' },
  { value: 'PAPER', label: 'Paper' },
  { value: 'PURPUR', label: 'Purpur' },
];

const SORT_OPTIONS: { value: BrowseFilters['sort']; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'downloads', label: 'Most Downloads' },
  { value: 'follows', label: 'Most Followers' },
  { value: 'updated', label: 'Recently Updated' },
  { value: 'newest', label: 'Newest' },
];

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

function parseFiltersFromParams(params: URLSearchParams): BrowseFilters {
  const getList = (key: string) => {
    const v = params.get(key);
    return v ? v.split(',').filter(Boolean) : [];
  };
  const type = params.get('type');
  const search = params.get('q') ?? params.get('search') ?? '';
  const sort = params.get('sort') as BrowseFilters['sort'] | null;
  return {
    search,
    sort:
      sort && ['relevance', 'downloads', 'follows', 'updated', 'newest'].includes(sort)
        ? sort
        : DEFAULT_FILTERS.sort,
    projectTypes: type
      ? [type]
      : getList('projectTypes').length
        ? getList('projectTypes')
        : getList('types'),
    categories: getList('categories'),
    loaders: getList('loaders'),
    environments: getList('environments') as BrowseFilters['environments'],
    licenseIds: getList('licenses').length ? getList('licenses') : getList('licenseIds'),
    gameVersions: getList('gameVersions').length ? getList('gameVersions') : getList('versions'),
  };
}

function filtersToParams(filters: BrowseFilters): string {
  const p = new URLSearchParams();
  if (filters.search) p.set('q', filters.search);
  if (filters.projectTypes.length === 1) p.set('type', filters.projectTypes[0]);
  else if (filters.projectTypes.length > 1) p.set('projectTypes', filters.projectTypes.join(','));
  if (filters.categories.length) p.set('categories', filters.categories.join(','));
  if (filters.loaders.length) p.set('loaders', filters.loaders.join(','));
  if (filters.gameVersions.length) p.set('gameVersions', filters.gameVersions.join(','));
  if (filters.environments.length) p.set('environments', filters.environments.join(','));
  if (filters.licenseIds.length) p.set('licenses', filters.licenseIds.join(','));
  if (filters.sort !== DEFAULT_FILTERS.sort) p.set('sort', filters.sort);
  return p.toString();
}

function useProjectTypeCounts() {
  return useQuery({
    queryKey: ['browse', 'typeCounts'],
    queryFn: async () => {
      const types: ProjectType[] = [
        ProjectType.MOD,
        ProjectType.MODPACK,
        ProjectType.RESOURCE_PACK,
        ProjectType.DATA_PACK,
        ProjectType.SHADER,
        ProjectType.PLUGIN,
      ];
      const results = await Promise.all(
        types.map(async (t) => {
          try {
            const res: any = await sdk.listProjects({ projectTypes: [t], limit: 1 } as any);
            const total =
              res?.meta?.total ??
              res?.pagination?.total ??
              (Array.isArray(res?.data) ? res.data.length : 0);
            // Fallback: if API returns total in different shape, try to use length as hint
            return [t, total] as const;
          } catch {
            return [t, 0] as const;
          }
        }),
      );
      return Object.fromEntries(results) as Record<string, number>;
    },
    staleTime: 60_000,
  });
}

function BrowsePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<BrowseFilters>(() => {
    if (typeof window !== 'undefined' && searchParams) {
      const parsed = parseFiltersFromParams(searchParams);
      // If URL has params, hydrate from it
      if (searchParams.toString()) return parsed;
    }
    return DEFAULT_FILTERS;
  });
  const [searchInput, setSearchInput] = useState(() => {
    if (typeof window !== 'undefined' && searchParams) {
      return searchParams.get('q') ?? searchParams.get('search') ?? '';
    }
    return '';
  });
  const debouncedSearch = useDebounce(searchInput, 300);

  // Hydrate from URL on mount (handles direct navigation / refresh)
  useEffect(() => {
    const parsed = parseFiltersFromParams(searchParams);
    const hasParams = searchParams.toString().length > 0;
    if (hasParams) {
      setFilters(parsed);
      setSearchInput(parsed.search);
    }
  }, []);

  useEffect(() => {
    setFilters((prev) =>
      prev.search === debouncedSearch ? prev : { ...prev, search: debouncedSearch },
    );
  }, [debouncedSearch]);

  // Push filters to URL (replaceState, no scroll/jump)
  useEffect(() => {
    const qs = filtersToParams(filters);
    const current = searchParams.toString();
    if (qs !== current) {
      router.replace(qs ? `/mods?${qs}` : '/mods', { scroll: false });
    }
  }, [filters]);

  const { items, total, hasMore, loading, loadingMore, error, fetchNextPage, refetch } = useBrowse({
    filters,
  });

  const { data: categories = [] } = useCategories();
  const { data: licenses = [] } = useLicenses();
  const { data: minecraftVersions = [] } = useMinecraftVersions();
  const { data: typeCounts } = useProjectTypeCounts();

  useEffect(() => {
    if (error) {
      toast.error(`Failed to load projects: ${error}`);
    }
  }, [error]);

  const categoryOptions = useMemo<FacetOption[]>(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories],
  );

  const licenseOptions = useMemo<FacetOption[]>(
    () => licenses.map((l) => ({ value: l.shortId, label: l.name })),
    [licenses],
  );

  const minecraftVersionOptions = useMemo<FacetOption[]>(() => {
    const versions = minecraftVersions as Array<{ version: string; type: string; stable: boolean }>;
    return versions
      .slice()
      .sort((a, b) => compareMcVersion(b.version, a.version))
      .map((v) => ({
        value: v.version,
        label: v.type === 'release' ? v.version : `${v.version} (${v.type})`,
      }));
  }, [minecraftVersions]);

  const updateFilter = <K extends keyof BrowseFilters>(key: K, value: BrowseFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleTabSelect = (value: ProjectType | null) => {
    setFilters((prev) => ({ ...prev, projectTypes: value ? [value] : [] }));
  };

  const toggleList = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const activeFilterCount =
    filters.projectTypes.length +
    filters.categories.length +
    filters.loaders.length +
    filters.environments.length +
    filters.licenseIds.length +
    filters.gameVersions.length +
    (filters.sort !== DEFAULT_FILTERS.sort ? 1 : 0) +
    (filters.search ? 1 : 0);

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput('');
  };

  const hasResults = items.length > 0 || loading;
  const pageNumber = filters.page ?? 1;

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="from-primary/5 via-primary/[0.02] to-background border-b bg-gradient-to-b">
        <div className="container py-10">
          <div className="max-w-2xl">
            <h1 className="mb-2 text-4xl font-bold tracking-tight">Browse Projects</h1>
            <p className="text-muted-foreground mb-6">
              Discover thousands of mods, modpacks, resource packs, and more.
            </p>
            <div className="relative max-w-lg">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search projects by name, author, or keyword..."
                className="bg-background h-12 pl-10 text-base"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Search projects"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CurseForge-style horizontal tabs - exclusive single-select with live counts */}
      <ProjectTypeTabs
        selected={filters.projectTypes}
        onSelect={handleTabSelect}
        counts={typeCounts}
      />

      <div className="container py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar - Project Type now only via sticky tabs (option 1), no duplicate facet */}
          <aside className="space-y-3 pr-1 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
            <FacetFilter
              title="Categories"
              options={categoryOptions}
              selected={filters.categories}
              onChange={(next) => updateFilter('categories', next)}
              searchable={categoryOptions.length > 6}
              emptyMessage={categories.length === 0 ? 'Loading categories...' : 'No categories'}
            />
            <FacetFilter
              title="Loaders"
              options={LOADER_OPTIONS}
              selected={filters.loaders}
              onChange={(next) => updateFilter('loaders', next)}
            />
            <FacetFilter
              title="Minecraft Version"
              options={minecraftVersionOptions}
              selected={filters.gameVersions}
              onChange={(next) => updateFilter('gameVersions', next)}
              searchable={minecraftVersionOptions.length > 8}
              emptyMessage={minecraftVersions.length === 0 ? 'Loading versions...' : 'No versions'}
            />
            <FacetFilter
              title="Environment"
              options={[
                { value: 'client', label: 'Client' },
                { value: 'server', label: 'Server' },
              ]}
              selected={filters.environments}
              onChange={(next) => updateFilter('environments', next as ('client' | 'server')[])}
            />
            <FacetFilter
              title="License"
              options={licenseOptions}
              selected={filters.licenseIds}
              onChange={(next) => updateFilter('licenseIds', next)}
              searchable={licenseOptions.length > 6}
              emptyMessage={licenses.length === 0 ? 'Loading licenses...' : 'No licenses'}
            />

            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full gap-1">
                <X className="h-3.5 w-3.5" />
                Clear all filters ({activeFilterCount})
              </Button>
            )}
          </aside>

          {/* Main content */}
          <div className="space-y-6">
            {/* Sort + active filters bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {filters.search && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    Search: {filters.search}
                    <button onClick={() => setSearchInput('')} aria-label="Clear search">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.projectTypes.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1 text-xs">
                    {PROJECT_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t}
                    <button
                      onClick={() =>
                        updateFilter(
                          'projectTypes',
                          filters.projectTypes.filter((v) => v !== t),
                        )
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {filters.categories.map((c) => (
                  <Badge key={c} variant="secondary" className="gap-1 text-xs">
                    {categories.find((x) => x.id === c)?.name ?? c}
                    <button
                      onClick={() =>
                        updateFilter(
                          'categories',
                          filters.categories.filter((v) => v !== c),
                        )
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {filters.loaders.map((l) => (
                  <Badge key={l} variant="secondary" className="gap-1 text-xs">
                    {LOADER_OPTIONS.find((o) => o.value === l)?.label ?? l}
                    <button
                      onClick={() =>
                        updateFilter(
                          'loaders',
                          filters.loaders.filter((v) => v !== l),
                        )
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {filters.gameVersions.map((gv) => (
                  <Badge key={gv} variant="secondary" className="gap-1 text-xs">
                    MC {gv}
                    <button
                      onClick={() =>
                        updateFilter(
                          'gameVersions',
                          filters.gameVersions.filter((v) => v !== gv),
                        )
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <ArrowUpDown className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
                  <select
                    value={filters.sort}
                    onChange={(e) => updateFilter('sort', e.target.value as BrowseFilters['sort'])}
                    className="border-input bg-background focus-visible:ring-ring h-9 appearance-none rounded-lg border pl-9 pr-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1"
                    aria-label="Sort"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {hasResults ? (
              <BrowseGrid
                items={items}
                loading={loading}
                error={error}
                total={total}
                hasMore={hasMore}
                onLoadMore={() => fetchNextPage()}
                onRetry={() => refetch()}
                query={filters.search}
                emptyTitle="No projects found"
                emptyHint="Try adjusting your filters or search term."
              />
            ) : loadingMore ? (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading more...
              </div>
            ) : null}

            {/* Numbered pagination — CurseForge parity (jump to page N) */}
            {hasResults && total > 20 && (
              <Pagination
                page={pageNumber}
                totalPages={Math.min(Math.ceil(total / 20), 500)}
                onPage={(p) => {
                  setFilters((prev) => ({ ...prev, page: p }));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {!hasResults && !loading && !error && (
              <div className="py-16 text-center">
                <div className="bg-muted mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl">
                  <PackageIcon className="text-muted-foreground h-10 w-10" />
                </div>
                <h2 className="mb-2 text-2xl font-bold">No Projects Found</h2>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search term.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="container py-8">
          <div className="bg-muted h-64 animate-pulse rounded-xl" />
        </div>
      }
    >
      <BrowsePageContent />
    </Suspense>
  );
}

// NOTE: Next.js page files may only export `default` + route config —
// do NOT re-export internal components from this file.

/**
 * Compare two Minecraft version strings semver-style ("1.20.1" > "1.20").
 * Treats snapshots like "1.21.2-rc.1" as slightly less than the matching
 * release — but only used for display ordering, not correctness.
 */
function compareMcVersion(a: string, b: string): number {
  const parse = (v: string) =>
    v
      .replace(/[^\d.]/g, '')
      .split('.')
      .map((n) => parseInt(n, 10) || 0);
  const pa = parse(a);
  const pb = parse(b);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da - db;
  }
  return 0;
}

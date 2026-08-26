'use client';

import React from 'react';
import Link from 'next/link';
import { BrowseGrid } from '@/components/browse-grid';
import { useBrowse, type BrowseFilters } from '@/hooks/use-browse';
import { Button } from '@mcp/ui/components/button';

export interface DiscoverClientProps {
  filters: Omit<BrowseFilters, 'search' | 'sort' | 'page'>;
  /** Pre-applied sort to keep SEO pages stable. */
  sort?: BrowseFilters['sort'];
  /** Heading shown above the grid (e.g., "Fabric mods"). */
  heading: string;
  /** Short description rendered under the heading. */
  description?: string;
  /** Sub-heading shown when zero projects match. */
  emptyHint: string;
  /** Optional chip rail of related filters. */
  related?: { href: string; label: string }[];
}

/**
 * SEO browse shell: takes a pre-applied facet and renders the standard
 * BrowseGrid. Used by /loaders/[loader], /versions/[version] and
 * /categories/[slug] — all server-rendered metadata + client-side data.
 */
export function DiscoverClient({
  filters,
  sort = 'downloads',
  heading,
  description,
  emptyHint,
  related,
}: DiscoverClientProps) {
  const merged: BrowseFilters = { search: '', sort, page: 1, ...filters };
  const { items, loading, error, hasMore, fetchNextPage, total } = useBrowse({ filters: merged });

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{heading}</h1>
        {description && <p className="text-muted-foreground max-w-2xl text-lg">{description}</p>}
        {related && related.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {related.map((r) => (
              <Button key={r.href} asChild variant="outline" size="sm">
                <Link href={r.href}>{r.label}</Link>
              </Button>
            ))}
          </div>
        )}
      </header>

      <BrowseGrid
        items={items}
        loading={loading}
        error={error}
        total={total}
        hasMore={hasMore}
        onLoadMore={() => fetchNextPage()}
        onRetry={() => fetchNextPage()}
        emptyTitle="Nothing here yet"
        emptyHint={emptyHint}
      />
    </div>
  );
}

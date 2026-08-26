'use client';

import React from 'react';
import { Loader2, Package as PackageIcon } from 'lucide-react';
import { ProjectCard } from '@/components/project-card';
import { Button } from '@mcp/ui/components/button';
import type { Project } from '@mcp/types';

export interface BrowseGridItem {
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

export interface BrowseGridProps {
  items: BrowseGridItem[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  emptyTitle?: string;
  emptyHint?: string;
  query?: string;
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-card space-y-3 rounded-xl border p-5">
          <div className="flex items-start gap-4">
            <div className="bg-muted h-14 w-14 shrink-0 animate-pulse rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="bg-muted h-5 w-32 animate-pulse rounded" />
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
            </div>
          </div>
          <div className="bg-muted h-4 w-full animate-pulse rounded" />
          <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  onRetry,
  title = 'No Projects Found',
  hint = 'Try adjusting your filters or search term.',
}: {
  onRetry?: () => void;
  title?: string;
  hint?: string;
}) {
  return (
    <div className="py-16 text-center">
      <div className="bg-muted mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl">
        <PackageIcon className="text-muted-foreground h-10 w-10" />
      </div>
      <h2 className="mb-2 text-2xl font-bold">{title}</h2>
      <p className="text-muted-foreground mx-auto mb-6 max-w-md">{hint}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="border-destructive/30 bg-destructive/5 rounded-xl border p-6 text-center">
      <p className="text-destructive mb-3 font-medium">Failed to load projects</p>
      <p className="text-muted-foreground mb-4 text-sm">{message}</p>
      <Button onClick={onRetry} variant="outline" size="sm">
        Try Again
      </Button>
    </div>
  );
}

export function BrowseGrid({
  items,
  loading,
  error,
  total,
  hasMore,
  onLoadMore,
  onRetry,
  emptyTitle,
  emptyHint,
  query,
}: BrowseGridProps) {
  if (loading && items.length === 0) return <GridSkeleton />;

  if (error && items.length === 0) return <ErrorState message={error} onRetry={onRetry} />;

  if (items.length === 0) {
    return <EmptyState title={emptyTitle} hint={emptyHint} onRetry={onRetry} />;
  }

  return (
    <div className="space-y-6">
      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <p>
          Showing <strong className="text-foreground">{items.length.toLocaleString()}</strong> of{' '}
          <strong className="text-foreground">{total.toLocaleString()}</strong>
          {query && (
            <>
              {' '}
              for &quot;<strong className="text-foreground">{query}</strong>&quot;
            </>
          )}
        </p>
        {loading && (
          <span className="flex items-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating...
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const asProject: Project = {
            id: item.id,
            title: item.title,
            slug: item.slug,
            description: item.description,
            iconUrl: item.iconUrl,
            downloads: item.downloads,
            views: 0,
            status: 'PUBLISHED' as any,
            projectType: (item.projectType as any) ?? 'MOD',
            featured: false,
            clientSide: true,
            serverSide: true,
            authorId: '',
            createdAt: item.updatedAt,
            updatedAt: item.updatedAt,
            latestVersion: item.latestVersion,
            author: item.author,
          } as Project;
          return <ProjectCard key={item.id} project={asProject} />;
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loading}
            className="min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>Load More</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default BrowseGrid;

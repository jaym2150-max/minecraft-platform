'use client';

import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { Badge } from '@mcp/ui/components/badge';
import { cn } from '@/lib/utils';
import { formatNumber, formatDate } from '@mcp/utils/helpers';
import type { VersionDisplay } from '@/hooks/use-project';

export interface VersionTableProps {
  versions: VersionDisplay[];
  className?: string;
  onDownload?: (version: VersionDisplay) => void;
  downloadingId?: string | null;
}

function loaderColor(loader: string): string {
  const map: Record<string, string> = {
    FABRIC: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
    FORGE: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30',
    NEOFORGE: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30',
    QUILT: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
    BUKKIT: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30',
    SPIGOT: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
    PAPER: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30',
    PURPUR: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-500/30',
  };
  return map[loader.toUpperCase()] ?? 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-500/30';
}

function normalizeLoader(loader: string): string {
  const trimmed = loader.trim().toUpperCase();
  if (trimmed === 'FABRIC') return 'FABRIC';
  if (trimmed === 'FORGE') return 'FORGE';
  if (trimmed === 'NEOFORGE') return 'NEOFORGE';
  if (trimmed === 'QUILT') return 'QUILT';
  if (trimmed === 'BUKKIT') return 'BUKKIT';
  if (trimmed === 'SPIGOT') return 'SPIGOT';
  if (trimmed === 'PAPER') return 'PAPER';
  if (trimmed === 'PURPUR') return 'PURPUR';
  return trimmed;
}

const DEFAULT_LOADERS = ['FABRIC', 'FORGE', 'NEOFORGE', 'QUILT', 'BUKKIT', 'SPIGOT', 'PAPER', 'PURPUR'];

export function VersionTable({ versions, className, onDownload, downloadingId }: VersionTableProps) {
  const loaders = React.useMemo(() => {
    const set = new Set<string>(DEFAULT_LOADERS);
    for (const v of versions) {
      if (v.loader) set.add(normalizeLoader(v.loader));
    }
    return Array.from(set);
  }, [versions]);

  const rows = React.useMemo(() => {
    const map = new Map<string, VersionDisplay>();
    for (const v of versions) {
      const key = `${v.version}__${v.minecraft || ''}`;
      if (!map.has(key)) map.set(key, v);
    }
    return Array.from(map.values()).sort((a, b) => {
      if (a.updatedAt === b.updatedAt) return 0;
      return a.updatedAt > b.updatedAt ? -1 : 1;
    });
  }, [versions]);

  const isAvailable = (row: VersionDisplay, loader: string) => {
    return normalizeLoader(row.loader) === loader;
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        No versions published yet.
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto rounded-xl border bg-card', className)}>
      <table className="w-full text-sm" data-testid="version-table">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="text-left font-medium px-4 py-3 sticky left-0 bg-muted/40 z-10 min-w-[180px]">
              Version
            </th>
            {loaders.map((loader, i) => (
              <th key={`${loader}-${i}`} className="px-2 py-3 text-center font-medium min-w-[90px]">
                <span
                  className={cn(
                    'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    loaderColor(loader),
                  )}
                >
                  {loader}
                </span>
              </th>
            ))}
            <th className="px-4 py-3 text-right font-medium min-w-[120px]">Downloads</th>
            <th className="px-4 py-3 text-right font-medium hidden md:table-cell min-w-[140px]">Released</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.id}-${row.version}`} className="border-b last:border-b-0 hover:bg-muted/30">
              <td className="px-4 py-3 sticky left-0 bg-card z-10">
                <div className="flex flex-col">
                  <span className="font-medium">v{row.version}</span>
                  <span className="text-xs text-muted-foreground">
                    {row.minecraft ? `MC ${row.minecraft}` : 'No MC version'}
                  </span>
                </div>
              </td>
              {loaders.map((loader, i) => (
                <td key={`${loader}-${i}`} className="px-2 py-3 text-center">
                  {isAvailable(row, loader) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1"
                      onClick={() => onDownload?.(row)}
                      disabled={downloadingId === row.id}
                    >
                      {downloadingId === row.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                      Download
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground/40">—</span>
                  )}
                </td>
              ))}
              <td className="px-4 py-3 text-right">
                <Badge variant="secondary" className="text-xs">
                  {formatNumber(row.downloadsRaw)}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden md:table-cell">
                {formatDate(row.updatedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default VersionTable;

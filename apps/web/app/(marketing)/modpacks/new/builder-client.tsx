'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { sdk } from '@/services/api';
import { useMinecraftVersions } from '@/hooks/use-browse';
import { LOADER_SLUGS } from '@/lib/loaders';
import { Button } from '@mcp/ui/components/button';
import { Input } from '@mcp/ui/components/input';
import { Badge } from '@mcp/ui/components/badge';
import { Card } from '@mcp/ui/components/card';
import {
  Loader2,
  Package,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Download,
  Github,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface Seed {
  id: string;
  slug: string;
  title: string;
}

export default function ModpackBuilderClient() {
  const { data: mcVersions } = useMinecraftVersions();
  const [gameVersion, setGameVersion] = useState<string>('1.21.1');
  const [loaderType, setLoaderType] = useState<string>('FABRIC');
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    sdk
      .search(debounced.trim(), { limit: 8 })
      .then((res: any) => {
        if (cancelled) return;
        const items = Array.isArray(res?.data) ? res.data : [];
        setResults(items);
      })
      .catch(() => setResults([]))
      .finally(() => {
        if (!cancelled) setSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const addSeed = (p: any) => {
    if (seeds.some((s) => s.slug === p.slug)) return;
    setSeeds((prev) => [...prev, { id: p.id, slug: p.slug, title: p.title }]);
    setQuery('');
    setResults([]);
  };

  const resolve = async () => {
    if (seeds.length === 0) return;
    setResolving(true);
    setError(null);
    setResult(null);
    try {
      const res: any = await sdk.previewModpack({
        seeds: seeds.map((s) => s.slug),
        gameVersion,
        loaderType,
      });
      setResult(res?.data ?? res);
    } catch (e: any) {
      setError(e?.message ?? 'Resolve failed');
    } finally {
      setResolving(false);
    }
  };

  const scoreColor = useMemo(() => {
    const s = result?.score ?? 0;
    if (s >= 80) return 'text-emerald-600';
    if (s >= 50) return 'text-amber-600';
    return 'text-red-600';
  }, [result]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Modpack Builder</h1>
        <p className="text-muted-foreground">
          Pick version + loader, add mods, resolve dependencies and export.
        </p>
      </header>

      <Card className="p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium">Minecraft version</label>
            <select
              value={gameVersion}
              onChange={(e) => setGameVersion(e.target.value)}
              className="mt-1 w-full rounded border p-2 text-sm"
            >
              {(mcVersions ?? []).slice(0, 20).map((v: any) => (
                <option key={v.version} value={v.version}>
                  {v.version}
                </option>
              ))}
              {!mcVersions?.length && <option value="1.21.1">1.21.1</option>}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Loader</label>
            <select
              value={loaderType}
              onChange={(e) => setLoaderType(e.target.value)}
              className="mt-1 w-full rounded border p-2 text-sm"
            >
              {LOADER_SLUGS.map((l) => (
                <option key={l.type} value={l.type}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={resolve} disabled={seeds.length === 0 || resolving} className="w-full">
              {resolving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Package className="mr-2 h-4 w-4" />
              )}
              Resolve ({seeds.length})
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Seeds ({seeds.length})</h2>
          {seeds.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSeeds([])}>
              Clear
            </Button>
          )}
        </div>
        {seeds.length === 0 ? (
          <p className="text-muted-foreground mt-2 text-sm">No mods added yet. Search below.</p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {seeds.map((s) => (
            <Badge key={s.slug} variant="secondary" className="flex items-center gap-1">
              {s.title}
              <button
                onClick={() => setSeeds((prev) => prev.filter((x) => x.slug !== s.slug))}
                aria-label={`Remove ${s.title}`}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="mt-4">
          <Input
            placeholder="Search mods to add…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {searching && (
            <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching…
            </div>
          )}
          {results.length > 0 && (
            <div className="mt-2 divide-y rounded border">
              {results.map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => addSeed(p)}
                  className="hover:bg-muted flex w-full items-center gap-3 p-2 text-left"
                >
                  {p.iconUrl ? (
                    <img src={p.iconUrl} alt="" className="h-8 w-8 rounded" />
                  ) : (
                    <Package className="text-muted-foreground h-8 w-8" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.title}</div>
                    <div className="text-muted-foreground truncate text-xs">{p.slug}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {error && (
        <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      {result && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Resolution</h2>
            <span className={`text-lg font-bold ${scoreColor}`}>{result.score}/100</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Resolved {result.resolvedCount} projects — {result.conflicts?.length ?? 0} conflicts
          </p>

          {result.conflicts?.length > 0 && (
            <div className="mt-3 space-y-2">
              {result.conflicts.map((c: any, i: number) => (
                <div key={i} className="flex items-start gap-2 rounded bg-amber-50 p-2 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <span className="font-medium">[{c.kind}]</span> {c.message}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 space-y-2">
            {Object.values(result.nodes ?? {}).map((n: any) => (
              <div
                key={n.projectId}
                className="flex items-center justify-between rounded border p-2"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <Link href={`/mod/${n.slug}`} className="text-sm font-medium hover:underline">
                    {n.title}
                  </Link>
                  <span className="text-muted-foreground text-xs">v{n.version ?? '—'}</span>
                  <Badge variant="outline" className="text-xs">
                    {n.score}/100
                  </Badge>
                </div>
                <span className="text-muted-foreground text-xs">depth {n.depth}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/mods`}>
                <Github className="mr-2 h-4 w-4" /> Browse more
              </Link>
            </Button>
            <Button
              onClick={async () => {
                const blob = new Blob([JSON.stringify(result, null, 2)], {
                  type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `modpack-${gameVersion}-${loaderType.toLowerCase()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="mr-2 h-4 w-4" /> Export JSON
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { sdk } from '@/services/api';
import { Button } from '@mcp/ui/components/button';
import { Input } from '@mcp/ui/components/input';
import { Card, CardContent, CardHeader, CardTitle } from '@mcp/ui/components/card';

export default function AiClient() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res: any = await sdk.aiSemanticSearch(q, 12);
      setData(res?.data ?? res);
    } catch (e: any) {
      setError(e?.message ?? 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header>
        <h1 className="text-3xl font-bold">AI Search</h1>
        <p className="text-muted-foreground">
          Natural language — try “technology mods for Fabric 1.21.1”.
        </p>
      </header>
      <div className="flex gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. technology mods for Fabric 1.21.1"
          onKeyDown={(e) => e.key === 'Enter' && run()}
        />
        <Button onClick={run} disabled={loading || !q.trim()}>
          {loading ? 'Searching…' : 'Search'}
        </Button>
      </div>
      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <p className="text-muted-foreground text-sm">{data.explanation}</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {(data.results ?? []).map((p: any) => (
                <Link
                  key={p.id}
                  href={`/mod/${p.slug}`}
                  className="hover:bg-muted rounded border p-3"
                >
                  <div className="font-medium">{p.title}</div>
                  <div className="text-muted-foreground line-clamp-2 text-xs">{p.description}</div>
                </Link>
              ))}
              {(data.results ?? []).length === 0 && (
                <p className="text-muted-foreground text-sm">No results.</p>
              )}
            </div>
            {data.parsed && (
              <div className="text-muted-foreground mt-4 text-xs">
                Parsed: loaders {data.parsed.loaders?.join(', ') || '—'} · versions{' '}
                {data.parsed.gameVersions?.join(', ') || '—'} · search “{data.parsed.search || '—'}”
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

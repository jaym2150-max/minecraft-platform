'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Search } from 'lucide-react';
import { adminApi } from '@/lib/api';

const KINDS: string[] = [
  'all',
  'DUPLICATE_TITLE',
  'DUPLICATE_SLUG',
  'DUPLICATE_EXTERNAL',
  'MISSING_DESCRIPTION',
  'MISSING_ICON',
  'MISSING_VERSIONS',
  'BROKEN_SOURCE_URL',
  'BROKEN_DISCORD_URL',
  'BROKEN_WIKI_URL',
  'INACTIVE_RELEASE_TRAIL',
];

export default function DataQualityPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [kind, setKind] = useState('all');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [issuesRes, summaryRes] = await Promise.all([
        adminApi.listDataQualityIssues({
          kind: kind === 'all' ? undefined : kind,
          status: 'OPEN',
          limit: 100,
        }),
        adminApi.getDataQualitySummary(),
      ]);
      const list = Array.isArray(issuesRes?.data) ? issuesRes.data : [];
      setIssues(list);
      const s = summaryRes?.data ?? summaryRes;
      setSummary(s);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load data quality data');
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    load();
  }, [load]);

  const runScan = async () => {
    setScanning(true);
    setError(null);
    try {
      const res: any = await adminApi.runDataQualityScan();
      const data = res?.data ?? res;
      setError(
        `Scan finished: scanned ${data.scanned ?? '?'} projects, ${data.openIssues ?? '?'} open issues.`,
      );
      load();
    } catch (err: any) {
      setError(err?.message ?? 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const setStatus = async (id: string, status: 'IGNORED' | 'RESOLVED') => {
    try {
      await adminApi.setDataQualityStatus(id, status);
      setIssues((prev) => prev.filter((i) => i.id !== id));
    } catch (err: any) {
      setError(err?.message ?? 'Failed to update issue');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Quality</h1>
          <p className="text-muted-foreground">
            Duplicate + missing + broken-link + deprecated detection
          </p>
        </div>
        <button
          onClick={runScan}
          disabled={scanning}
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded px-4 py-2 text-sm disabled:opacity-50"
        >
          {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}{' '}
          Run full scan
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded border bg-white p-4">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">Open issues</div>
            <div className="text-2xl font-bold">
              {summary.open ?? summary.openIssues ?? issues.length}
            </div>
          </div>
          <div className="rounded border bg-white p-4">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">By kind</div>
            <div className="mt-1 text-xs">
              {Object.entries(summary.byKind ?? {}).map(([k, v]: any) => (
                <div key={k} className="flex justify-between">
                  <span>{k}</span>
                  <span className="font-medium">{String(v)}</span>
                </div>
              ))}
              {Object.keys(summary.byKind ?? {}).length === 0 && (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          </div>
          <div className="rounded border bg-white p-4">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">By severity</div>
            <div className="mt-1 text-xs">
              {Object.entries(summary.bySeverity ?? {}).map(([k, v]: any) => (
                <div key={k} className="flex justify-between">
                  <span>Level {k}</span>
                  <span className="font-medium">{String(v)}</span>
                </div>
              ))}
              {Object.keys(summary.bySeverity ?? {}).length === 0 && (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`rounded px-3 py-1 text-xs ${kind === k ? 'bg-primary text-primary-foreground' : 'border bg-white'}`}
          >
            {k === 'all' ? 'All' : k.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      ) : issues.length === 0 ? (
        <div className="text-muted-foreground rounded border bg-white p-8 text-center text-sm">
          No open issues.
        </div>
      ) : (
        <div className="overflow-hidden rounded border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr className="text-left">
                <th className="p-2">Kind</th>
                <th className="p-2">Project</th>
                <th className="p-2">Detail</th>
                <th className="p-2">Severity</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((iss: any) => (
                <tr key={iss.id} className="border-t">
                  <td className="p-2 font-mono text-xs">{iss.kind}</td>
                  <td className="p-2">{iss.project?.title ?? iss.projectId ?? '—'}</td>
                  <td className="max-w-[360px] p-2 text-xs">{iss.detail}</td>
                  <td className="p-2">{iss.severity}</td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setStatus(iss.id, 'IGNORED')}
                        className="hover:bg-muted rounded border px-2 py-1 text-xs"
                      >
                        Ignore
                      </button>
                      <button
                        onClick={() => setStatus(iss.id, 'RESOLVED')}
                        className="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="inline h-3 w-3" /> Resolve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

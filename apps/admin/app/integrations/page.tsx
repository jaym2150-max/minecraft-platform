'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  RefreshCw,
  Loader2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Hourglass,
  Database,
} from 'lucide-react';
import { adminApi } from '@/lib/api';

const statusBadge: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  RUNNING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-red-100 text-red-700',
};

const StatusIcon: Record<string, any> = {
  PENDING: Hourglass,
  RUNNING: Loader2,
  COMPLETED: CheckCircle2,
  FAILED: XCircle,
};

function formatDate(v?: string | null) {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

function durationMs(start?: string | null, end?: string | null) {
  if (!start) return '—';
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  if (Number.isNaN(s) || Number.isNaN(e)) return '—';
  const ms = e - s;
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export default function IntegrationsPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [singleSlug, setSingleSlug] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try {
      const [provRes, jobsRes] = await Promise.all([
        adminApi.listProviders(),
        adminApi.listSyncs({ limit: 20 }),
      ]);
      setProviders(Array.isArray(provRes?.data) ? provRes.data : []);
      setJobs(Array.isArray(jobsRes?.data) ? jobsRes.data : []);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const trigger = async (type: string, extra: Record<string, unknown> = {}) => {
    setActing(type);
    setError(null);
    try {
      await adminApi.triggerSync(type, extra);
      // poll after a short delay so the job appears
      setTimeout(load, 1500);
    } catch (err: any) {
      setError(err?.message ?? `Failed to trigger ${type}`);
    } finally {
      setActing(null);
    }
  };

  const triggerSingle = async () => {
    const slug = singleSlug.trim();
    if (!slug) return;
    setActing('SINGLE_PROJECT');
    setError(null);
    try {
      await adminApi.syncProject(slug);
      setSingleSlug('');
      setTimeout(load, 1500);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to trigger single-project sync');
    } finally {
      setActing(null);
    }
  };

  const openJob = async (id: string) => {
    try {
      const res = await adminApi.getSync(id);
      setSelected(res?.data ?? res);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load job detail');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="mt-1 text-slate-600">
          External provider sync — Modrinth catalog, incremental updates and stats refresh
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Providers */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Providers</h2>
        {loading ? (
          <div className="flex items-center justify-center rounded-lg border bg-white py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : providers.length === 0 ? (
          <div className="rounded-lg border bg-white p-8 text-center text-sm text-slate-500">
            No providers registered yet. Trigger a sync to create the Modrinth provider.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {providers.map((p: any) => (
              <div key={p.id} className="rounded-lg border bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-slate-500" />
                      <span className="font-semibold">{p.name}</span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {p.slug}
                      </span>
                      {!p.enabled && (
                        <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
                          disabled
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{p.apiUrl}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${p.syncInProgress ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {p.syncInProgress ? 'syncing' : 'idle'}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-slate-500">Linked projects</div>
                    <div className="text-lg font-semibold">{p.linkedProjects ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Last sync</div>
                    <div className="text-sm">
                      {p.lastSync ? formatDate(p.lastSync.createdAt) : '—'}
                    </div>
                    {p.lastSync && (
                      <div className="text-xs">
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs ${statusBadge[p.lastSync.status] ?? 'bg-slate-100'}`}
                        >
                          {p.lastSync.status}
                        </span>{' '}
                        <span className="text-slate-500">
                          {p.lastSync.processedCount ?? 0} processed · {p.lastSync.errorCount ?? 0}{' '}
                          errors
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trigger controls */}
      <section className="rounded-lg border bg-white p-5">
        <h3 className="font-semibold">Trigger sync</h3>
        <p className="mt-1 text-xs text-slate-500">
          Hourly incremental and daily stats refresh run automatically. Use these to run on demand.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => trigger('FULL_IMPORT')}
            disabled={!!acting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {acting === 'FULL_IMPORT' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Full import
          </button>
          <button
            onClick={() => trigger('INCREMENTAL')}
            disabled={!!acting}
            className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            {acting === 'INCREMENTAL' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            Incremental
          </button>
          <button
            onClick={() => trigger('STATS_REFRESH')}
            disabled={!!acting}
            className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            {acting === 'STATS_REFRESH' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            Stats refresh
          </button>
          <button
            onClick={load}
            disabled={!!acting}
            className="rounded-lg border bg-white px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
        <div className="mt-4 flex gap-2">
          <input
            value={singleSlug}
            onChange={(e) => setSingleSlug(e.target.value)}
            placeholder="project slug (e.g. sodium)"
            className="flex-1 rounded-lg border px-3 py-2 text-sm"
          />
          <button
            onClick={triggerSingle}
            disabled={!!acting || !singleSlug.trim()}
            className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            {acting === 'SINGLE_PROJECT' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Sync project
          </button>
        </div>
      </section>

      {/* Job history */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Sync history</h2>
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="p-3 text-left font-medium">Type</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Trigger</th>
                <th className="p-3 text-right font-medium">Processed</th>
                <th className="p-3 text-right font-medium">Created</th>
                <th className="p-3 text-right font-medium">Updated</th>
                <th className="p-3 text-right font-medium">Errors</th>
                <th className="p-3 text-left font-medium">Started</th>
                <th className="p-3 text-left font-medium">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No sync runs yet.
                  </td>
                </tr>
              ) : (
                jobs.map((j: any) => {
                  const Icon = StatusIcon[j.status] ?? Hourglass;
                  const isRunning = j.status === 'RUNNING';
                  return (
                    <tr
                      key={j.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => openJob(j.id)}
                    >
                      <td className="p-3 font-medium">{j.type}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${statusBadge[j.status] ?? 'bg-slate-100'}`}
                        >
                          <Icon className={`h-3 w-3 ${isRunning ? 'animate-spin' : ''}`} />
                          {String(j.status).toLowerCase()}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">
                        {String(j.trigger ?? '').toLowerCase()}
                      </td>
                      <td className="p-3 text-right">{j.processedCount ?? 0}</td>
                      <td className="p-3 text-right">{j.createdCount ?? 0}</td>
                      <td className="p-3 text-right">{j.updatedCount ?? 0}</td>
                      <td className="p-3 text-right">{j.errorCount ?? 0}</td>
                      <td className="p-3 text-slate-600">
                        {formatDate(j.startedAt ?? j.createdAt)}
                      </td>
                      <td className="p-3 text-slate-600">
                        {durationMs(j.startedAt ?? j.createdAt, j.finishedAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {selected && (
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                Job {selected.id.slice(0, 8)} · {selected.type} ·{' '}
                {String(selected.status).toLowerCase()}
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="rounded border px-3 py-1 text-sm hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            {selected.message && <p className="mt-2 text-sm text-slate-600">{selected.message}</p>}
            <div className="mt-2 text-xs text-slate-500">
              {formatDate(selected.startedAt)} → {formatDate(selected.finishedAt)} ·{' '}
              {durationMs(selected.startedAt, selected.finishedAt)}
            </div>
            <div className="mt-4 max-h-80 overflow-auto rounded border bg-slate-50 p-3 font-mono text-xs">
              {(selected.logs ?? []).length === 0 ? (
                <span className="text-slate-400">No log lines.</span>
              ) : (
                (selected.logs as any[]).map((l: any) => (
                  <div
                    key={l.id}
                    className={
                      l.level === 'ERROR'
                        ? 'text-red-700'
                        : l.level === 'WARN'
                          ? 'text-amber-700'
                          : 'text-slate-700'
                    }
                  >
                    <span className="text-slate-400">[{formatDate(l.createdAt)}]</span> [{l.level}]{' '}
                    {l.message}
                    {l.detail && (
                      <span className="text-slate-500"> — {l.detail.slice(0, 300)}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, X, Loader2, AlertTriangle } from 'lucide-react';
import { adminApi } from '@/lib/api';

const STATUS_FILTERS = ['all', 'PENDING', 'RESOLVED', 'DISMISSED'];

const statusBadge: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
  DISMISSED: 'bg-slate-100 text-slate-700',
};

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [reportsRes, statsRes] = await Promise.all([
        adminApi.listReports({ page: 1, limit: 50, status: filter === 'all' ? undefined : filter }),
        adminApi.getReportStats(),
      ]);
      setReports(Array.isArray(reportsRes?.data) ? reportsRes.data : []);
      setStats(statsRes?.data ?? statsRes);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const resolve = async (id: string, status: 'RESOLVED' | 'DISMISSED') => {
    setActing(id);
    try {
      await adminApi.resolveReport(id, status);
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      load();
    } catch (err: any) {
      setError(`Failed to update report: ${err?.message ?? 'request failed'}`);
    } finally {
      setActing(null);
    }
  };

  const formatDate = (v?: string) => {
    if (!v) return '—';
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="mt-1 text-slate-600">Review and resolve user-submitted reports</p>
      </div>

      {stats && (
        <div className="flex gap-4 text-sm text-slate-600">
          <span>
            Pending: <strong className="text-slate-900">{stats.pending ?? 0}</strong>
          </span>
          <span>
            Resolved: <strong className="text-slate-900">{stats.resolved ?? 0}</strong>
          </span>
          <span>
            Dismissed: <strong className="text-slate-900">{stats.dismissed ?? 0}</strong>
          </span>
          <span>
            Total: <strong className="text-slate-900">{stats.total ?? 0}</strong>
          </span>
        </div>
      )}

      <div className="flex gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'border bg-white hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'all' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="p-4 text-left font-medium">Reason</th>
                <th className="p-4 text-left font-medium">Target</th>
                <th className="p-4 text-left font-medium">Reporter</th>
                <th className="p-4 text-left font-medium">Date</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No reports match this filter.
                  </td>
                </tr>
              ) : (
                reports.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-medium">{r.reason}</div>
                      {r.description && (
                        <div className="mt-0.5 max-w-[280px] truncate text-xs text-slate-500">
                          {r.description}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-slate-600">
                      {r.project?.title ??
                        (r.reported?.username
                          ? `@${r.reported.username}`
                          : r.reportedId
                            ? r.reportedId.slice(0, 8)
                            : '—')}
                    </td>
                    <td className="p-4 text-slate-600">@{r.reporter?.username ?? 'unknown'}</td>
                    <td className="p-4 text-slate-600">{formatDate(r.createdAt)}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${statusBadge[r.status] ?? 'bg-slate-100 text-slate-700'}`}
                      >
                        {(r.status ?? 'PENDING').toLowerCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {acting === r.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                        ) : r.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => resolve(r.id, 'RESOLVED')}
                              className="rounded p-1 text-emerald-700 hover:bg-emerald-100"
                              aria-label="Resolve report"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => resolve(r.id, 'DISMISSED')}
                              className="rounded p-1 text-red-700 hover:bg-red-100"
                              aria-label="Dismiss report"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

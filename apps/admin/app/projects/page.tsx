'use client';

import { useCallback, useEffect, useState } from 'react';
import { Eye, Check, X, Loader2, AlertTriangle, Star } from 'lucide-react';
import { adminApi } from '@/lib/api';

const statusStyle: Record<string, string> = {
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  SUBMITTED: 'bg-amber-100 text-amber-700',
  REJECTED: 'bg-red-100 text-red-700',
  ARCHIVED: 'bg-slate-100 text-slate-700',
  DRAFT: 'bg-slate-100 text-slate-700',
};

const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3003';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Initial search comes from ?q= (header search links here), then stays local.
  const [search, setSearch] = useState(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('q') ?? '';
  });
  const [status, setStatus] = useState('');
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listProjects({
        page: 1,
        limit: 50,
        q: search || undefined,
        status: status || undefined,
      });
      const items = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
      setProjects(items);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatusAction = async (p: any, next: 'PUBLISHED' | 'REJECTED') => {
    setActing(p.id);
    try {
      await adminApi.updateProjectStatus(p.id, next);
      setProjects((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: next } : x)));
    } catch (err: any) {
      setError(`Failed to update ${p.title}: ${err?.message ?? 'request failed'}`);
    } finally {
      setActing(null);
    }
  };

  const toggleFeature = async (p: any) => {
    setActing(p.id);
    try {
      await adminApi.updateProjectFeature(p.id, !p.featured);
      setProjects((prev) => prev.map((x) => (x.id === p.id ? { ...x, featured: !x.featured } : x)));
    } catch (err: any) {
      setError(`Failed to toggle featured for ${p.title}: ${err?.message ?? 'request failed'}`);
    } finally {
      setActing(null);
    }
  };

  const formatDate = (v?: string) => {
    if (!v) return '—';
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="mt-1 text-slate-600">Review and moderate project submissions</p>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md flex-1 rounded-lg border bg-white px-4 py-2"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border bg-white px-4 py-2"
        >
          <option value="">All statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="SUBMITTED">Pending</option>
          <option value="ARCHIVED">Archived</option>
          <option value="REJECTED">Rejected</option>
        </select>
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
                <th className="p-4 text-left font-medium">Title</th>
                <th className="p-4 text-left font-medium">Author</th>
                <th className="p-4 text-left font-medium">Downloads</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-left font-medium">Featured</th>
                <th className="p-4 text-left font-medium">Updated</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No projects found.
                  </td>
                </tr>
              ) : (
                projects.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-4 font-medium">{p.title}</td>
                    <td className="p-4 text-slate-600">@{p.author?.username ?? 'unknown'}</td>
                    <td className="p-4">{(p.downloads ?? 0).toLocaleString()}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${statusStyle[p.status] ?? 'bg-slate-100 text-slate-700'}`}
                      >
                        {(p.status ?? 'UNKNOWN').toLowerCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleFeature(p)}
                        disabled={acting === p.id}
                        aria-label={p.featured ? `Unfeature ${p.title}` : `Feature ${p.title}`}
                        className="cursor-pointer disabled:opacity-50"
                      >
                        {p.featured ? (
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ) : (
                          <Star className="h-4 w-4 text-slate-300" />
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-slate-600">{formatDate(p.updatedAt)}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <a
                          href={`${webUrl}/mod/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded p-1 hover:bg-slate-200"
                          aria-label={`View ${p.title}`}
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        {p.status === 'SUBMITTED' && acting !== p.id && (
                          <>
                            <button
                              onClick={() => setStatusAction(p, 'PUBLISHED')}
                              className="rounded p-1 text-emerald-700 hover:bg-emerald-100"
                              aria-label={`Approve ${p.title}`}
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setStatusAction(p, 'REJECTED')}
                              className="rounded p-1 text-red-700 hover:bg-red-100"
                              aria-label={`Reject ${p.title}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {acting === p.id && (
                          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-slate-500">Public page links open on the main site ({webUrl}).</p>
    </div>
  );
}

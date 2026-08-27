'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, Loader2, Plus, Trash2, Save, X } from 'lucide-react';
import { adminApi } from '@/lib/api';

const STATUSES: string[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

const EMPTY: any = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  category: 'installation',
  status: 'DRAFT',
};

export default function GuidesPage() {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<any | null>(null); // null = list view; '' = new; id = edit
  const [form, setForm] = useState<any>(EMPTY);
  const [filter, setFilter] = useState('all');
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await adminApi.listAllGuides();
      const list = Array.isArray(res?.data) ? res.data : [];
      setGuides(list);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load guides');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startCreate = () => {
    setEditing('');
    setForm({ ...EMPTY });
  };

  const startEdit = (g: any) => {
    setEditing(g.id);
    setForm({
      title: g.title ?? '',
      slug: g.slug ?? '',
      excerpt: g.excerpt ?? '',
      body: g.body ?? '',
      category: g.category ?? 'installation',
      status: g.status ?? 'DRAFT',
    });
  };

  const cancel = () => {
    setEditing(null);
    setForm({ ...EMPTY });
  };

  const submit = async () => {
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setError(null);
    try {
      if (editing === '') {
        await adminApi.createGuide({
          title: form.title,
          slug: form.slug || undefined,
          excerpt: form.excerpt || undefined,
          body: form.body || undefined,
          category: form.category || undefined,
          status: form.status,
        });
      } else if (editing) {
        await adminApi.updateGuide(editing, {
          title: form.title,
          slug: form.slug || undefined,
          excerpt: form.excerpt || undefined,
          body: form.body || undefined,
          category: form.category || undefined,
          status: form.status,
        });
      }
      cancel();
      load();
    } catch (err: any) {
      setError(err?.message ?? 'Save failed');
    }
  };

  const remove = async (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Delete this guide?')) return;
    try {
      await adminApi.deleteGuide(id);
      load();
    } catch (err: any) {
      setError(err?.message ?? 'Delete failed');
    }
  };

  const seed = async () => {
    setSeeding(true);
    setError(null);
    try {
      await adminApi.seedGuides();
      load();
    } catch (err: any) {
      setError(err?.message ?? 'Seed failed');
    } finally {
      setSeeding(false);
    }
  };

  const filtered = useMemo(
    () => (filter === 'all' ? guides : guides.filter((g) => g.status === filter)),
    [filter, guides],
  );

  if (editing !== null) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{editing === '' ? 'New guide' : 'Edit guide'}</h1>
          <button onClick={cancel} className="rounded border px-3 py-1 text-sm">
            <X className="inline h-4 w-4" /> Cancel
          </button>
        </div>
        {error && (
          <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {error}
          </div>
        )}
        <div className="space-y-3 rounded border bg-white p-4">
          <Field label="Title *">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Slug (optional)">
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="auto-generated from title if blank"
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Category">
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Excerpt">
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
              rows={2}
            />
          </Field>
          <Field label="Body (markdown)">
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="w-full rounded border px-3 py-2 font-mono text-xs"
              rows={12}
            />
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="rounded border px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex gap-2 pt-2">
            <button
              onClick={submit}
              className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded px-4 py-2 text-sm"
            >
              <Save className="h-4 w-4" /> Save
            </button>
            <button onClick={cancel} className="rounded border px-3 py-2 text-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <BookOpen className="h-6 w-6" /> Guides
        </h1>
        <div className="flex gap-2">
          <button
            onClick={seed}
            disabled={seeding}
            className="rounded border px-3 py-2 text-sm disabled:opacity-50"
          >
            {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Seed defaults'}
          </button>
          <button
            onClick={startCreate}
            className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded px-3 py-2 text-sm"
          >
            <Plus className="h-4 w-4" /> New
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {['all', ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded px-3 py-1 text-xs ${filter === s ? 'bg-primary text-primary-foreground' : 'border bg-white'}`}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-muted-foreground rounded border bg-white p-8 text-center text-sm">
          No guides.
        </div>
      ) : (
        <div className="overflow-hidden rounded border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr className="text-left">
                <th className="p-2">Title</th>
                <th className="p-2">Slug</th>
                <th className="p-2">Category</th>
                <th className="p-2">Status</th>
                <th className="p-2">Views</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g: any) => (
                <tr key={g.id} className="border-t">
                  <td className="p-2 font-medium">{g.title}</td>
                  <td className="p-2 font-mono text-xs">{g.slug}</td>
                  <td className="p-2 text-xs">{g.category ?? '—'}</td>
                  <td className="p-2 text-xs">{g.status}</td>
                  <td className="p-2 text-xs">{g.views ?? 0}</td>
                  <td className="space-x-1 p-2 text-right">
                    <button
                      onClick={() => startEdit(g)}
                      className="rounded border px-2 py-1 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(g.id)}
                      className="rounded border px-2 py-1 text-xs text-red-600"
                    >
                      <Trash2 className="inline h-3 w-3" />
                    </button>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-muted-foreground text-xs uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

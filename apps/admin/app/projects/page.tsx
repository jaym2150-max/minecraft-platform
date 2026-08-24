'use client';

import { MoreHorizontal, Eye, Check, X } from 'lucide-react';

const PROJECTS = [
  { id: '1', title: 'Sodium', author: 'caffeinemc', downloads: 12500000, status: 'published', featured: true, updated: '2d ago' },
  { id: '2', title: 'Just Enough Items', author: 'mezz', downloads: 15100000, status: 'published', featured: true, updated: '5d ago' },
  { id: '3', title: 'Create', author: 'simibubi', downloads: 8200000, status: 'published', featured: true, updated: '1w ago' },
  { id: '4', title: 'Iris Shaders', author: 'irisshaders', downloads: 6800000, status: 'published', featured: false, updated: '2w ago' },
  { id: '5', title: 'NewAdventure Mod', author: 'newmodder', downloads: 0, status: 'pending', featured: false, updated: '1h ago' },
  { id: '6', title: 'Old Project', author: 'archive_user', downloads: 12000, status: 'archived', featured: false, updated: '3mo ago' },
  { id: '7', title: 'SpamMod', author: 'spammer_42', downloads: 0, status: 'rejected', featured: false, updated: '1d ago' },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-slate-600 mt-1">Review and moderate project submissions</p>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder="Search projects..."
          className="flex-1 max-w-md px-4 py-2 rounded-lg border bg-white"
        />
        <select className="px-4 py-2 rounded-lg border bg-white">
          <option>All statuses</option>
          <option>Published</option>
          <option>Pending</option>
          <option>Archived</option>
          <option>Rejected</option>
        </select>
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium">Title</th>
              <th className="text-left p-4 font-medium">Author</th>
              <th className="text-left p-4 font-medium">Downloads</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Featured</th>
              <th className="text-left p-4 font-medium">Updated</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {PROJECTS.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium">{p.title}</td>
                <td className="p-4 text-slate-600">@{p.author}</td>
                <td className="p-4">{p.downloads.toLocaleString()}</td>
                <td className="p-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      p.status === 'published'
                        ? 'bg-emerald-100 text-emerald-700'
                        : p.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : p.status === 'archived'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="p-4">{p.featured ? '⭐' : '—'}</td>
                <td className="p-4 text-slate-600">{p.updated}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-1 rounded hover:bg-slate-200">
                      <Eye className="h-4 w-4" />
                    </button>
                    {p.status === 'pending' && (
                      <>
                        <button className="p-1 rounded hover:bg-emerald-100 text-emerald-700">
                          <Check className="h-4 w-4" />
                        </button>
                        <button className="p-1 rounded hover:bg-red-100 text-red-700">
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button className="p-1 rounded hover:bg-slate-200">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

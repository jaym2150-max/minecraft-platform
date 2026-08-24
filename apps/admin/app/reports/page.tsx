'use client';

import { useState } from 'react';
import { Check, X, Eye } from 'lucide-react';

const REPORTS = [
  { id: '1', type: 'project', reason: 'Malware distribution', target: 'SuperMod v2.1', reporter: 'user_42', date: '5m ago', status: 'pending' },
  { id: '2', type: 'comment', reason: 'Spam / advertising', target: 'Comment on Sodium', reporter: 'user_89', date: '14m ago', status: 'pending' },
  { id: '3', type: 'user', reason: 'Impersonation', target: '@fakeadmin', reporter: 'user_15', date: '1h ago', status: 'pending' },
  { id: '4', type: 'project', reason: 'Copyright violation', target: 'Create Recreation', reporter: 'user_72', date: '2h ago', status: 'reviewing' },
  { id: '5', type: 'comment', reason: 'Harassment', target: 'Comment by @griefer', reporter: 'user_31', date: '3h ago', status: 'resolved' },
  { id: '6', type: 'version', reason: 'Malicious code', target: 'Mod v3.0', reporter: 'user_88', date: '5h ago', status: 'pending' },
];

export default function ReportsPage() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? REPORTS : REPORTS.filter((r) => r.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-slate-600 mt-1">Review and resolve user-submitted reports</p>
      </div>

      <div className="flex gap-2">
        {['all', 'pending', 'reviewing', 'resolved', 'dismissed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === f ? 'bg-slate-900 text-white' : 'bg-white border hover:bg-slate-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium">Type</th>
              <th className="text-left p-4 font-medium">Reason</th>
              <th className="text-left p-4 font-medium">Target</th>
              <th className="text-left p-4 font-medium">Reporter</th>
              <th className="text-left p-4 font-medium">Date</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="p-4 capitalize">{r.type}</td>
                <td className="p-4">{r.reason}</td>
                <td className="p-4 font-medium">{r.target}</td>
                <td className="p-4 text-slate-600">{r.reporter}</td>
                <td className="p-4 text-slate-600">{r.date}</td>
                <td className="p-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      r.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : r.status === 'reviewing'
                        ? 'bg-blue-100 text-blue-700'
                        : r.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <button className="p-1 rounded hover:bg-slate-200">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1 rounded hover:bg-emerald-100 text-emerald-700">
                      <Check className="h-4 w-4" />
                    </button>
                    <button className="p-1 rounded hover:bg-red-100 text-red-700">
                      <X className="h-4 w-4" />
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

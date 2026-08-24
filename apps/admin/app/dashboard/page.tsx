'use client';

import Link from 'next/link';
import { Users, FolderKanban, Flag, ShieldAlert, TrendingUp, Download } from 'lucide-react';

const stats = [
  { label: 'Total Users', value: '12,438', change: '+8.2%', icon: Users, href: '/users' },
  { label: 'Total Projects', value: '4,291', change: '+12.1%', icon: FolderKanban, href: '/projects' },
  { label: 'Open Reports', value: '23', change: '-15.4%', icon: Flag, href: '/reports' },
  { label: 'Pending Scans', value: '7', change: '+2', icon: ShieldAlert, href: '/malware' },
  { label: 'Downloads Today', value: '89,432', change: '+22.7%', icon: Download, href: '/analytics' },
  { label: 'Active Now', value: '847', change: '+5.1%', icon: TrendingUp, href: '/analytics' },
];

const recentReports = [
  { id: '1', type: 'project', reason: 'Malware', reporter: 'user_42', target: 'SuperMod v2.1', time: '5m ago', status: 'pending' },
  { id: '2', type: 'comment', reason: 'Spam', reporter: 'user_89', target: 'Comment on Sodium', time: '14m ago', status: 'pending' },
  { id: '3', type: 'user', reason: 'Impersonation', reporter: 'user_15', target: '@fakeadmin', time: '1h ago', status: 'pending' },
  { id: '4', type: 'project', reason: 'Copyright', reporter: 'user_72', target: 'Create Recreation', time: '2h ago', status: 'reviewing' },
];

const recentScans = [
  { id: '1', filename: 'sodium-fabric-0.5.8.jar', result: 'clean', size: '1.2 MB', time: '3m ago' },
  { id: '2', filename: 'unknown-mod.zip', result: 'infected', size: '4.5 MB', time: '12m ago' },
  { id: '3', filename: 'jei-1.20.1-fabric.jar', result: 'clean', size: '892 KB', time: '24m ago' },
  { id: '4', filename: 'shaders-mod.jar', result: 'clean', size: '2.1 MB', time: '38m ago' },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back. Here&apos;s what&apos;s happening on the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="block rounded-lg border bg-white p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600">{s.label}</p>
                  <p className="text-3xl font-bold mt-2">{s.value}</p>
                  <p
                    className={`text-sm mt-2 ${
                      s.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {s.change} from last week
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-slate-700" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-white">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="font-semibold">Recent Reports</h2>
            <Link href="/reports" className="text-sm text-slate-600 hover:text-slate-900">
              View all →
            </Link>
          </div>
          <div className="divide-y">
            {recentReports.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <p className="font-medium text-sm">{r.target}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {r.type} • {r.reason} • {r.time}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    r.status === 'pending'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-white">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="font-semibold">Recent Malware Scans</h2>
            <Link href="/malware" className="text-sm text-slate-600 hover:text-slate-900">
              View all →
            </Link>
          </div>
          <div className="divide-y">
            {recentScans.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{s.filename}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {s.size} • {s.time}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    s.result === 'clean'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {s.result}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

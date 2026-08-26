'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Users,
  FolderKanban,
  Flag,
  Download,
  PackagePlus,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { adminApi } from '@/lib/api';

interface DashboardData {
  analytics: any;
  reports: any[];
  loading: boolean;
  error: string | null;
}

export default function AdminDashboardPage() {
  const [{ analytics, reports, loading, error }, setState] = useState<DashboardData>({
    analytics: null,
    reports: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [analyticsRes, reportsRes] = await Promise.all([
          adminApi.getAnalytics(),
          adminApi.listReports({ page: 1, limit: 5, status: 'PENDING' }),
        ]);
        if (cancelled) return;
        setState({
          analytics: analyticsRes?.data ?? analyticsRes,
          reports: Array.isArray(reportsRes?.data) ? reportsRes.data : [],
          loading: false,
          error: null,
        });
      } catch (err: any) {
        if (!cancelled) {
          setState({
            analytics: null,
            reports: [],
            loading: false,
            error: err?.message ?? 'Failed to load dashboard',
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-slate-600">
            Welcome back. Here&apos;s what&apos;s happening on the platform.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-6">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
          <div>
            <p className="font-medium text-red-800">Could not load platform data</p>
            <p className="mt-1 text-sm text-red-700">
              {error}. Check that the API is running and you are signed in as an admin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Users',
      value: analytics?.users?.total ?? 0,
      sub: `${analytics?.users?.banned ?? 0} banned`,
      icon: Users,
      href: '/users',
    },
    {
      label: 'Total Projects',
      value: analytics?.projects?.total ?? 0,
      sub: `${analytics?.newProjectsToday ?? 0} new today`,
      icon: FolderKanban,
      href: '/projects',
    },
    {
      label: 'Pending Reports',
      value: analytics?.reports?.pending ?? 0,
      sub: `${analytics?.reports?.total ?? 0} total`,
      icon: Flag,
      href: '/reports',
    },
    {
      label: 'Downloads Today',
      value: analytics?.downloads?.today ?? 0,
      sub: `${analytics?.downloads?.total ?? 0} all time`,
      icon: Download,
      href: '/analytics',
    },
    {
      label: 'Published Projects',
      value: analytics?.projects?.published ?? 0,
      sub: `${analytics?.projects?.pending ?? 0} awaiting review`,
      icon: PackagePlus,
      href: '/projects',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-slate-600">
          Welcome back. Here&apos;s what&apos;s happening on the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="block rounded-lg border bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600">{s.label}</p>
                  <p className="mt-2 text-3xl font-bold">{Number(s.value).toLocaleString()}</p>
                  <p className="mt-2 text-sm text-slate-500">{s.sub}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                  <Icon className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white">
          <div className="flex items-center justify-between border-b p-6">
            <h2 className="font-semibold">Open Reports</h2>
            <Link href="/reports" className="text-sm text-slate-600 hover:text-slate-900">
              View all →
            </Link>
          </div>
          {reports.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No open reports. Nice and quiet.</p>
          ) : (
            <div className="divide-y">
              {reports.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.reason}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {r.project?.title ??
                        (r.reported?.username ? `@${r.reported.username}` : r.id.slice(0, 8))}{' '}
                      • reported by {r.reporter?.username ?? 'unknown'}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">
                    {r.status?.toLowerCase() ?? 'pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-white">
          <div className="flex items-center justify-between border-b p-6">
            <h2 className="font-semibold">Moderation Queue</h2>
            <Link href="/projects" className="text-sm text-slate-600 hover:text-slate-900">
              Review →
            </Link>
          </div>
          <div className="space-y-3 p-6 text-sm text-slate-600">
            <p>
              <strong className="text-slate-900">{analytics?.projects?.pending ?? 0}</strong>{' '}
              project submissions are awaiting review.
            </p>
            <p>
              <strong className="text-slate-900">{analytics?.reports?.pending ?? 0}</strong> user
              reports need a decision.
            </p>
            <p className="pt-2 text-xs text-slate-400">
              Every uploaded file goes through an automated ClamAV scan before review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

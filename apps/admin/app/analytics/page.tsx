'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, AlertTriangle } from 'lucide-react';
import { adminApi } from '@/lib/api';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminApi.getAnalytics();
        if (!cancelled) setAnalytics(res?.data ?? res);
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? 'Failed to load analytics');
      } finally {
        if (!cancelled) setLoading(false);
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

  if (error || !analytics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Platform Analytics</h1>
          <p className="mt-1 text-slate-600">Insights into platform-wide metrics</p>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
          <p className="text-sm text-red-700">{error ?? 'No analytics data available.'}</p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Downloads',
      value: analytics.downloads?.total ?? 0,
      sub: `${analytics.downloads?.today ?? 0} today`,
    },
    {
      label: 'Total Users',
      value: analytics.users?.total ?? 0,
      sub: `${analytics.users?.banned ?? 0} banned`,
    },
    {
      label: 'Total Projects',
      value: analytics.projects?.total ?? 0,
      sub: `${analytics.newProjectsToday ?? 0} today`,
    },
    {
      label: 'Pending Reports',
      value: analytics.reports?.pending ?? 0,
      sub: `${analytics.reports?.total ?? 0} total`,
    },
  ];

  const statusData = [
    { status: 'Published', count: analytics.projects?.published ?? 0, fill: '#10b981' },
    { status: 'Pending', count: analytics.projects?.pending ?? 0, fill: '#f59e0b' },
    { status: 'Archived', count: analytics.projects?.archived ?? 0, fill: '#64748b' },
    { status: 'Rejected', count: analytics.projects?.rejected ?? 0, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <p className="mt-1 text-slate-600">Live platform metrics from the API (no estimates)</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-white p-6">
            <p className="text-sm text-slate-600">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold">{Number(stat.value).toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-500">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b p-6">
          <h2 className="font-semibold">Projects by Status</h2>
          <p className="mt-0.5 text-sm text-slate-500">Current distribution across the platform</p>
        </div>
        <div className="h-72 p-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

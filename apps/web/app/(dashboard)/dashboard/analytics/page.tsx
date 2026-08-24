'use client';

import React, { useState, useMemo } from 'react';
import {
  Download,
  Eye,
  Users,
  Star,
  TrendingUp,
  TrendingDown,
  Smartphone,
  Monitor,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@mcp/ui/components/card';
import { Button } from '@mcp/ui/components/button';
import { Badge } from '@mcp/ui/components/badge';
import { KpiCard } from '@/components/kpi-card';
import { useDashboardProjects, useUserAnalytics, useProjectAnalytics } from '@/hooks/use-dashboard';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// ── Types ──

type Period = '7d' | '30d' | '90d' | '1y';

// ── Static Data (illustrative until analytics API is available) ──

const periods: { value: Period; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
];

function generateDailyData(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      downloads: Math.floor(Math.random() * 1200 + 300),
      views: Math.floor(Math.random() * 2000 + 800),
    };
  });
}

const weeklyData = generateDailyData(7);
const monthlyData = generateDailyData(30);
const quarterlyData = generateDailyData(90);
const yearlyData = Array.from({ length: 12 }, (_, i) => {
  const date = new Date();
  date.setMonth(date.getMonth() - (11 - i));
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    downloads: Math.floor(Math.random() * 25000 + 5000),
    views: Math.floor(Math.random() * 40000 + 10000),
  };
});

const deviceData = [
  { name: 'Desktop', value: 65, color: 'hsl(142.1 70.6% 45.3%)' },
  { name: 'Mobile', value: 25, color: 'hsl(217.2 91.2% 59.8%)' },
  { name: 'Tablet', value: 10, color: 'hsl(271 81% 56%)' },
];

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-24 mb-3" />
              <div className="h-8 bg-muted rounded w-20 mb-2" />
              <div className="h-3 bg-muted rounded w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-[300px] bg-muted rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Page ──

export default function DashboardAnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d');
  const { projects, stats, loading, refetch } = useDashboardProjects();
  const { data: userAnalytics } = useUserAnalytics(period);

  // Real daily trend would come from userAnalytics if backend aggregates per-day across user projects.
  // Currently getUserAnalytics returns summary only, so charts stay illustrative with a fallback label.
  // When daily data is available (downloads.daily), prefer it; otherwise use generated sample.
  const hasRealDaily = !!(userAnalytics as any)?.downloads?.daily?.length;
  const chartData = hasRealDaily
    ? (userAnalytics as any).downloads.daily.map((d: any) => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        downloads: d.count,
        views: d.count ? Math.round(d.count * 1.8) : 0,
      }))
    : period === '7d' ? weeklyData
      : period === '30d' ? monthlyData
      : period === '90d' ? quarterlyData
      : yearlyData;

  // Loader distribution - now derived from real projects' loaders, fallback to illustrative if empty
  const loaderDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      const loader = (p.loader || '').toUpperCase();
      if (loader) counts[loader] = (counts[loader] || 0) + 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) {
      return [
        { name: 'Fabric', value: 58, color: 'hsl(217.2 91.2% 59.8%)' },
        { name: 'Forge', value: 28, color: 'hsl(25 95% 53%)' },
        { name: 'NeoForge', value: 10, color: 'hsl(271 81% 56%)' },
        { name: 'Quilt', value: 4, color: 'hsl(142.1 70.6% 45.3%)' },
      ];
    }
    const colors: Record<string, string> = {
      FABRIC: 'hsl(217.2 91.2% 59.8%)',
      FORGE: 'hsl(25 95% 53%)',
      NEOFORGE: 'hsl(271 81% 56%)',
      QUILT: 'hsl(142.1 70.6% 45.3%)',
      PAPER: 'hsl(142.1 70.6% 45.3%)',
      SPIGOT: 'hsl(25 95% 53%)',
      BUKKIT: 'hsl(271 81% 56%)',
      PURPUR: 'hsl(142.1 76.2% 36.3%)',
    };
    return Object.entries(counts).map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100),
      color: colors[name] || 'hsl(220 14% 40%)',
    }));
  }, [projects]);

  // Top projects - prefer API's topProjects if available (already sorted), fallback to client sort
  const topProjects = useMemo(() => {
    const source = (userAnalytics as any)?.topProjects?.length ? (userAnalytics as any).topProjects : projects;
    return [...source]
      .sort((a: any, b: any) => (b.downloads ?? 0) - (a.downloads ?? 0))
      .slice(0, 5)
      .map((p: any, i: number) => ({
        id: p.id,
        rank: i + 1,
        name: p.title ?? p.name,
        slug: p.slug,
        downloads: p.downloads ?? 0,
        status: p.status === 'PUBLISHED' ? 'Published' : p.status === 'DRAFT' ? 'Draft' : p.status ?? 'Published',
        updated: p.updated ?? (p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'recently'),
      }));
  }, [projects, userAnalytics]);

  const summary = (userAnalytics as any)?.summary ?? stats;
  const kpiCards = [
    { label: 'Total Projects', value: String(summary.totalProjects ?? stats.totalProjects), icon: Download, change: `${summary.publishedProjects ?? stats.publishedCount} published`, changeType: 'up' as const },
    { label: 'Total Downloads', value: (summary.totalDownloads ?? stats.totalDownloads) >= 1000 ? `${((summary.totalDownloads ?? stats.totalDownloads) / 1000).toFixed(1)}K` : String(summary.totalDownloads ?? stats.totalDownloads), icon: Eye, change: 'All time', changeType: 'up' as const },
    { label: 'Published', value: String(summary.publishedProjects ?? stats.publishedCount), icon: Users, change: `${summary.draftProjects ?? stats.draftCount} drafts`, changeType: 'up' as const },
    { label: 'Views', value: (summary.totalViews ?? stats.totalViews) >= 1000 ? `${((summary.totalViews ?? stats.totalViews) / 1000).toFixed(1)}K` : String(summary.totalViews ?? stats.totalViews), icon: Star, change: 'Across projects', changeType: 'up' as const },
  ];

  const topProjectId = topProjects[0]?.id ?? projects[0]?.id ?? '';
  const { data: topProjectAnalytics } = useProjectAnalytics(topProjectId, period);

  const versionBars = useMemo(() => {
    const byVersion = (topProjectAnalytics as any)?.downloads?.byVersion as Array<{ version: string; count: number }> | undefined;
    if (byVersion && byVersion.length > 0) {
      const sorted = [...byVersion].sort((a, b) => b.count - a.count).slice(0, 5);
      const max = Math.max(...sorted.map((v) => v.count), 1);
      return sorted.map((v) => ({ label: v.version, count: v.count, pct: (v.count / max) * 100 }));
    }
    return null;
  }, [topProjectAnalytics]);

  const statusPie = useMemo(() => {
    const byStatus = (userAnalytics as any)?.projectsByStatus as Array<{ status: string; count: number }> | undefined;
    if (byStatus && byStatus.length > 0) {
      const total = byStatus.reduce((a, b) => a + b.count, 0) || 1;
      const colors: Record<string, string> = { PUBLISHED: 'hsl(142.1 70.6% 45.3%)', DRAFT: 'hsl(38 92% 50%)', ARCHIVED: 'hsl(220 14% 40%)', REJECTED: 'hsl(0 84% 60%)' };
      return byStatus.map((s) => ({
        name: s.status,
        value: Math.round((s.count / total) * 100),
        count: s.count,
        color: colors[s.status] || 'hsl(220 14% 40%)',
      }));
    }
    return null;
  }, [userAnalytics]);

  if (loading) {
    return (
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
              <p className="text-muted-foreground mt-1">Track your mod performance and growth</p>
            </div>
          </div>
          <LoadingSkeleton />
          </div>
      );
    }

    return (
        <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground mt-1">Track your mod performance and growth</p>
          </div>
          <div className="flex items-center gap-2 p-1 rounded-lg border bg-card">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  period === p.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Downloads Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Downloads Over Time</CardTitle>
              <CardDescription>
                {period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : period === '90d' ? 'Last 90 days' : 'Last 12 months'}
                {' '}(illustrative)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="dlGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142.1 76.2% 36.3%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(142.1 76.2% 36.3%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      interval={period === '1y' ? 1 : 'preserveStartEnd'}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      width={50}
                      tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="downloads" stroke="hsl(142.1 76.2% 36.3%)" strokeWidth={2} fill="url(#dlGradient)" name="Downloads" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Views Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Views vs Downloads</CardTitle>
              <CardDescription>Comparing page views to download conversions (illustrative)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="viewGradient2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(217.2 91.2% 59.8%)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(217.2 91.2% 59.8%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      interval={period === '1y' ? 1 : 'preserveStartEnd'}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      width={50}
                      tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="views" stroke="hsl(217.2 91.2% 59.8%)" strokeWidth={2} fill="url(#viewGradient2)" name="Views" />
                    <Area type="monotone" dataKey="downloads" stroke="hsl(142.1 76.2% 36.3%)" strokeWidth={2} fill="none" strokeDasharray="4 4" name="Downloads" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Loader Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Loader Distribution</CardTitle>
              <CardDescription>Projects by mod loader</CardDescription>
            </CardHeader>
            <CardContent>
              {loaderDistribution.length === 0 ? (
                <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
                  No project data available
                </div>
              ) : (
                <>
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={loaderDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {loaderDistribution.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                          formatter={(value: number) => [`${value}%`, 'Share']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {loaderDistribution.map((item) => (
                      <div key={item.name} className="flex items-center gap-1.5 text-xs">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Top Versions - real per-project analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Top Versions</CardTitle>
              <CardDescription>
                {topProjectId ? `Downloads by version for ${topProjects[0]?.name ?? 'top project'} • ${period}` : 'Downloads by version'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {versionBars ? (
                <div className="space-y-3">
                  {versionBars.map((v) => (
                    <div key={v.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium truncate">v{v.label}</span>
                        <span className="text-muted-foreground">{v.count >= 1000 ? `${(v.count / 1000).toFixed(1)}K` : String(v.count)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${v.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {['1.21.1', '1.21', '1.20.6', '1.20.4', '1.20.2'].map((v, i) => {
                    const maxVal = 28500;
                    const val = 28500 - i * 3500;
                    const percentage = (val / maxVal) * 100;
                    return (
                      <div key={v} className="opacity-60">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium">MC {v}</span>
                          <span className="text-muted-foreground">{(val / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-muted-foreground text-center pt-2">Sample data - publish a version with downloads to see live bars</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects by Status - real */}
          <Card>
            <CardHeader>
              <CardTitle>Projects by Status</CardTitle>
              <CardDescription>Distribution of your projects</CardDescription>
            </CardHeader>
            <CardContent>
              {statusPie ? (
                <>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusPie}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {statusPie.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                          formatter={(value: number, _n, props: any) => [`${value}% (${props.payload.count})`, props.payload.name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {statusPie.map((item) => (
                      <div key={item.name} className="flex items-center gap-1.5 text-xs">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deviceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {deviceData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                          formatter={(value: number) => [`${value}%`, 'Share']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {deviceData.map((item) => (
                      <div key={item.name} className="text-center">
                        {item.name === 'Desktop' ? <Monitor className="h-4 w-4 mx-auto mb-1 text-muted-foreground" /> :
                         <Smartphone className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />}
                        <p className="text-xs text-muted-foreground">{item.name}</p>
                        <p className="text-sm font-bold">{item.value}%</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">Sample - create projects to see live status</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Projects Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Projects</CardTitle>
            <CardDescription>Ranked by total downloads</CardDescription>
          </CardHeader>
          <CardContent>
            {topProjects.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                No projects yet. Create your first project to see analytics.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-muted-foreground text-xs uppercase tracking-wider w-8">#</th>
                      <th className="pb-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Project</th>
                      <th className="pb-3 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Downloads</th>
                      <th className="pb-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="pb-3 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProjects.map((project) => (
                      <tr key={project.slug} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3.5">
                          <span className="text-sm font-medium text-muted-foreground">#{project.rank}</span>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                              project.rank === 1 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                              project.rank === 2 ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400' :
                              project.rank === 3 ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' :
                              'bg-primary/10 text-primary'
                            }`}>
                              <span className="font-bold text-xs">{project.name[0]}</span>
                            </div>
                            <span className="font-medium">{project.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 hidden sm:table-cell font-medium">
                          {project.downloads >= 1000000
                            ? `${(project.downloads / 1000000).toFixed(1)}M`
                            : project.downloads >= 1000
                            ? `${(project.downloads / 1000).toFixed(0)}K`
                            : String(project.downloads)}
                        </td>
                        <td className="py-3.5">
                          <Badge
                            variant={project.status === 'Published' ? 'secondary' : project.status === 'Draft' ? 'outline' : 'destructive'}
                            className="text-[10px] h-5"
                          >
                            {project.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 text-muted-foreground hidden sm:table-cell text-xs">{project.updated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}

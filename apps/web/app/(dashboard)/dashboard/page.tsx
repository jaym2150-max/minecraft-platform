'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Download,
  Eye,
  TrendingUp,
  Upload,
  ArrowUpRight,
  Star,
  Activity,
  BarChart3,
  MoreHorizontal,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@mcp/ui/components/card';
import { Badge } from '@mcp/ui/components/badge';
import { StatCard } from '@/components/stat-card';
import {
  useDashboardProjects,
  useUserAnalytics,
  useProjectAnalytics,
  DashboardProject,
} from '@/hooks/use-dashboard';
import { sdk } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { timeAgo } from '@mcp/utils/helpers';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ── Types ──

interface ActivityItem {
  id: string;
  type: 'release' | 'update' | 'review' | 'create';
  project: string;
  projectSlug: string;
  description: string;
  time: string;
}

const activityIcons: Record<ActivityItem['type'], React.ElementType> = {
  release: Upload,
  update: Activity,
  review: Star,
  create: Package,
};

const activityColors: Record<ActivityItem['type'], string> = {
  release: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  update: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  review: 'bg-green-500/10 text-green-600 dark:text-green-400',
  create: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
};

function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
  const Icon = activityIcons[type];
  return (
    <div
      className={`h-8 w-8 rounded-full ${activityColors[type]} ring-background flex shrink-0 items-center justify-center ring-2`}
    >
      <Icon className="h-4 w-4" />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="bg-muted mb-3 h-4 w-24 rounded" />
              <div className="bg-muted mb-2 h-8 w-20 rounded" />
              <div className="bg-muted h-3 w-32 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="bg-muted h-[280px] rounded-lg" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="bg-muted h-8 w-8 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="bg-muted h-3 w-24 rounded" />
                    <div className="bg-muted h-3 w-40 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-muted h-12 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page ──

export default function DashboardPage() {
  const { projects, stats, loading, error, refetch } = useDashboardProjects();
  const { data: userAnalytics } = useUserAnalytics('30d');
  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['analytics', 'activity', 'me'],
    queryFn: async () => {
      const res: any = await (sdk as any).getUserActivity?.(8);
      return Array.isArray(res?.data) ? res.data : [];
    },
  });
  const [showAllActivity, setShowAllActivity] = useState(false);
  const displayedActivity = showAllActivity ? (activity ?? []) : (activity ?? []).slice(0, 3);

  // Build the downloads chart from real analytics (last 14 days).
  const trend = (userAnalytics as any)?.downloadsTrend as
    Array<{ date: string; count: number }> | undefined;
  const chartData = (
    trend && trend.length
      ? trend.slice(-14)
      : Array.from({ length: 14 }, (_, i) => ({
          date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split('T')[0],
          count: 0,
        }))
  ).map((p) => ({ date: p.date, downloads: p.count, views: p.count }));

  const weeklyDownloads = chartData.slice(-7).reduce((s, d) => s + d.downloads, 0);
  const prevWeekDownloads = chartData.slice(0, 7).reduce((s, d) => s + d.downloads, 0);
  const downloadChange =
    prevWeekDownloads > 0
      ? (((weeklyDownloads - prevWeekDownloads) / prevWeekDownloads) * 100).toFixed(1)
      : '0.0';

  // Pull per-project totals off the user analytics response.
  const summary = (userAnalytics as any)?.summary ?? {};
  const totalProjects = summary.totalProjects ?? stats.totalProjects;
  const totalDownloads = summary.totalDownloads ?? stats.totalDownloads;
  const totalViews = summary.totalViews ?? stats.totalViews;
  const publishedCount = summary.publishedProjects ?? stats.publishedCount;
  const draftCount = summary.draftProjects ?? stats.draftCount;

  const statCards = [
    {
      label: 'Total Projects',
      value: String(totalProjects),
      icon: Package,
      change: `${publishedCount} published`,
      changeType: 'neutral' as const,
    },
    {
      label: 'Total Downloads',
      value:
        totalDownloads >= 1000 ? `${(totalDownloads / 1000).toFixed(1)}K` : String(totalDownloads),
      icon: Download,
      change: 'Across all projects',
      changeType: 'neutral' as const,
    },
    {
      label: 'Total Views',
      value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : String(totalViews),
      icon: Eye,
      change: 'Across all projects',
      changeType: 'neutral' as const,
    },
    {
      label: 'Active Projects',
      value: String(publishedCount),
      icon: Star,
      change: `${draftCount} still in draft`,
      changeType: 'neutral' as const,
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s your project overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/analytics">
              <BarChart3 className="mr-1.5 h-4 w-4" />
              View Analytics
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/uploads">
              <Upload className="mr-1.5 h-4 w-4" />
              Upload Mod
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/50 mb-6">
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-destructive text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Downloads Chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Downloads Overview</CardTitle>
                  <CardDescription>Last 14 days (your projects)</CardDescription>
                </div>
                <Badge variant="outline" className="gap-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  {downloadChange}% vs previous
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(21 90% 55%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(21 90% 55%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
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
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        width={45}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="views"
                        stroke="hsl(217.2 91.2% 59.8%)"
                        strokeWidth={2}
                        fill="url(#viewGradient)"
                        name="Views"
                      />
                      <Area
                        type="monotone"
                        dataKey="downloads"
                        stroke="hsl(21 90% 55%)"
                        strokeWidth={2}
                        fill="url(#downloadGradient)"
                        name="Downloads"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates from your projects</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <div className="text-muted-foreground py-6 text-center text-sm">
                    Loading activity…
                  </div>
                ) : (activity ?? []).length === 0 ? (
                  <div className="text-muted-foreground py-6 text-center text-sm">
                    No recent activity yet.
                  </div>
                ) : (
                  <>
                    <div className="space-y-0">
                      {displayedActivity.map((item: any, i: number) => (
                        <div key={item.id} className="flex gap-3 pb-4 last:pb-0">
                          <div className="flex flex-col items-center">
                            <ActivityIcon
                              type={(item.type === 'comment' ? 'update' : item.type) as any}
                            />
                            {i < displayedActivity.length - 1 && (
                              <div className="bg-border mt-1 w-px flex-1" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1 pt-1">
                            <Link
                              href={`/mod/${item.projectSlug}`}
                              className="hover:text-primary text-sm font-medium transition-colors"
                            >
                              {item.projectTitle ?? item.project ?? 'Project'}
                            </Link>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                              {item.description}
                            </p>
                            <p className="text-muted-foreground/60 mt-0.5 text-[11px]">
                              {item.createdAt ? timeAgo(item.createdAt) : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {(activity ?? []).length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 w-full gap-1"
                        onClick={() => setShowAllActivity(!showAllActivity)}
                      >
                        {showAllActivity
                          ? 'Show Less'
                          : `View All Activity (${(activity ?? []).length})`}
                        <ChevronRight
                          className={`h-3.5 w-3.5 transition-transform ${showAllActivity ? 'rotate-90' : ''}`}
                        />
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Your latest mod projects and their performance</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/projects" className="gap-1">
                  View All <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="bg-muted mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                    <Package className="text-muted-foreground/60 h-7 w-7" />
                  </div>
                  <h3 className="mb-1 text-lg font-semibold">No projects yet</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Create your first mod project to get started
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/uploads">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload a Mod
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="text-muted-foreground pb-3 text-xs font-medium uppercase tracking-wider">
                          Project
                        </th>
                        <th className="text-muted-foreground hidden pb-3 text-xs font-medium uppercase tracking-wider sm:table-cell">
                          Downloads
                        </th>
                        <th className="text-muted-foreground hidden pb-3 text-xs font-medium uppercase tracking-wider sm:table-cell">
                          Status
                        </th>
                        <th className="text-muted-foreground hidden pb-3 text-xs font-medium uppercase tracking-wider md:table-cell">
                          Updated
                        </th>
                        <th className="pb-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {projects.slice(0, 5).map((project) => (
                        <tr
                          key={project.id}
                          className="hover:bg-muted/50 border-b transition-colors last:border-0"
                        >
                          <td className="py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                                <span className="text-primary text-xs font-bold">
                                  {project.name[0]}
                                </span>
                              </div>
                              <Link
                                href={`/mod/${project.slug}`}
                                className="hover:text-primary font-medium transition-colors"
                              >
                                {project.name}
                              </Link>
                            </div>
                          </td>
                          <td className="hidden py-3.5 font-medium sm:table-cell">
                            {project.downloads.toLocaleString()}
                          </td>
                          <td className="hidden py-3.5 sm:table-cell">
                            <Badge
                              variant={
                                project.status === 'Published'
                                  ? 'secondary'
                                  : project.status === 'Draft'
                                    ? 'outline'
                                    : 'destructive'
                              }
                              className="h-5 text-[10px]"
                            >
                              {project.status}
                            </Badge>
                          </td>
                          <td className="text-muted-foreground hidden py-3.5 md:table-cell">
                            {project.updated}
                          </td>
                          <td className="py-3.5 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <Link href={`/mod/${project.slug}`}>
                                <ArrowUpRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

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
import { useDashboardProjects, DashboardProject } from '@/hooks/use-dashboard';
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

// ── Chart Mock Data (illustrative until analytics API is available) ──

const chartData = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    downloads: Math.floor(Math.random() * 800 + 200),
    views: Math.floor(Math.random() * 1500 + 500),
  };
});

// ── Mock Activity (until activity endpoint is implemented) ──

const recentActivity: ActivityItem[] = [
  { id: '1', type: 'release', project: 'Sodium', projectSlug: 'sodium', description: 'Released v0.12.1 for MC 1.21.1', time: '2h ago' },
  { id: '2', type: 'review', project: 'Iris Shaders', projectSlug: 'iris-shaders', description: 'Left a 5-star review', time: '1d ago' },
  { id: '3', type: 'update', project: 'Lithium', projectSlug: 'lithium', description: 'Updated description and gallery', time: '2d ago' },
  { id: '4', type: 'release', project: 'Sodium', projectSlug: 'sodium', description: 'Released v0.12.0 for MC 1.21', time: '5d ago' },
  { id: '5', type: 'create', project: 'DashLoader', projectSlug: 'dashloader', description: 'Created new project', time: '2w ago' },
];

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
    <div className={`h-8 w-8 rounded-full ${activityColors[type]} flex items-center justify-center shrink-0 ring-2 ring-background`}>
      <Icon className="h-4 w-4" />
    </div>
  );
}

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="h-[280px] bg-muted rounded-lg" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-40" />
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
              <div key={i} className="h-12 bg-muted rounded-lg" />
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
  const [showAllActivity, setShowAllActivity] = useState(false);
  const displayedActivity = showAllActivity ? recentActivity : recentActivity.slice(0, 3);
  const weeklyDownloads = chartData.slice(-7).reduce((s, d) => s + d.downloads, 0);
  const prevWeekDownloads = chartData.slice(0, 7).reduce((s, d) => s + d.downloads, 0);
  const downloadChange = ((weeklyDownloads - prevWeekDownloads) / prevWeekDownloads * 100).toFixed(1);

  const statCards = [
    { label: 'Total Projects', value: String(stats.totalProjects), icon: Package, change: `${stats.publishedCount} published`, changeType: 'neutral' as const },
    { label: 'Total Downloads', value: stats.totalDownloads >= 1000 ? `${(stats.totalDownloads / 1000).toFixed(1)}K` : String(stats.totalDownloads), icon: Download, change: 'Across all projects', changeType: 'neutral' as const },
    { label: 'Total Views', value: stats.totalViews >= 1000 ? `${(stats.totalViews / 1000).toFixed(1)}K` : String(stats.totalViews), icon: Eye, change: 'Across all projects', changeType: 'neutral' as const },
    { label: 'Active Projects', value: String(stats.publishedCount), icon: Star, change: `${stats.draftCount} still in draft`, changeType: 'neutral' as const },
  ];

  return (
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s your project overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/analytics">
                <BarChart3 className="h-4 w-4 mr-1.5" />
                View Analytics
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/dashboard/uploads">
                <Upload className="h-4 w-4 mr-1.5" />
                Upload Mod
              </Link>
            </Button>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-destructive/50">
            <CardContent className="p-4 flex items-center justify-between">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={refetch}>Retry</Button>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Downloads Chart */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Downloads Overview</CardTitle>
                    <CardDescription>Last 14 days (illustrative)</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs gap-1">
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
                            <stop offset="5%" stopColor="hsl(142.1 76.2% 36.3%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(142.1 76.2% 36.3%)" stopOpacity={0} />
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
                        <Area type="monotone" dataKey="views" stroke="hsl(217.2 91.2% 59.8%)" strokeWidth={2} fill="url(#viewGradient)" name="Views" />
                        <Area type="monotone" dataKey="downloads" stroke="hsl(142.1 76.2% 36.3%)" strokeWidth={2} fill="url(#downloadGradient)" name="Downloads" />
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
                  <div className="space-y-0">
                    {displayedActivity.map((item, i) => (
                      <div key={item.id} className="flex gap-3 pb-4 last:pb-0">
                        <div className="flex flex-col items-center">
                          <ActivityIcon type={item.type} />
                          {i < displayedActivity.length - 1 && (
                            <div className="w-px flex-1 bg-border mt-1" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <Link
                            href={`/mod/${item.projectSlug}`}
                            className="text-sm font-medium hover:text-primary transition-colors"
                          >
                            {item.project}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                          <p className="text-[11px] text-muted-foreground/60 mt-0.5">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {recentActivity.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-3 gap-1"
                      onClick={() => setShowAllActivity(!showAllActivity)}
                    >
                      {showAllActivity ? 'Show Less' : `View All Activity (${recentActivity.length})`}
                      <ChevronRight className={`h-3.5 w-3.5 transition-transform ${showAllActivity ? 'rotate-90' : ''}`} />
                    </Button>
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
                  <div className="text-center py-12">
                    <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <Package className="h-7 w-7 text-muted-foreground/60" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">No projects yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">Create your first mod project to get started</p>
                    <Button asChild>
                      <Link href="/dashboard/uploads">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload a Mod
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Project</th>
                          <th className="pb-3 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Downloads</th>
                          <th className="pb-3 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Status</th>
                          <th className="pb-3 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Updated</th>
                          <th className="pb-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {projects.slice(0, 5).map((project) => (
                          <tr key={project.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                            <td className="py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <span className="font-bold text-primary text-xs">{project.name[0]}</span>
                                </div>
                                <Link href={`/mod/${project.slug}`} className="font-medium hover:text-primary transition-colors">
                                  {project.name}
                                </Link>
                              </div>
                            </td>
                            <td className="py-3.5 font-medium hidden sm:table-cell">{project.downloads.toLocaleString()}</td>
                            <td className="py-3.5 hidden sm:table-cell">
                              <Badge
                                variant={project.status === 'Published' ? 'secondary' : project.status === 'Draft' ? 'outline' : 'destructive'}
                                className="text-[10px] h-5"
                              >
                                {project.status}
                              </Badge>
                            </td>
                            <td className="py-3.5 text-muted-foreground hidden md:table-cell">{project.updated}</td>
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

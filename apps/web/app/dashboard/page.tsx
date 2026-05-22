'use client';

import Link from 'next/link';
import { BarChart3, Upload, Package, Eye, TrendingUp, Download } from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@mcp/ui/components/card';

const stats = [
  { label: 'Total Projects', value: '12', icon: Package, change: '+2 this month' },
  { label: 'Total Downloads', value: '45.2K', icon: Download, change: '+12.5%' },
  { label: 'Total Views', value: '128.4K', icon: Eye, change: '+8.2%' },
  { label: 'Active Users', value: '3,421', icon: TrendingUp, change: '+5.7%' },
];

const recentProjects = [
  { name: 'Sodium', version: '1.21.1', downloads: 12500, status: 'Published' },
  { name: 'Lithium', version: '1.21', downloads: 8400, status: 'Published' },
  { name: 'Phosphor', version: '1.20.6', downloads: 3200, status: 'Draft' },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s your overview.</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/uploads">
              <Upload className="h-4 w-4 mr-2" />
              Upload Mod
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Your latest mod projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.name} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">MC {project.version}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{project.downloads.toLocaleString()} downloads</p>
                      <span className="text-xs text-muted-foreground">{project.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and navigation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/projects">
                  <Package className="h-4 w-4 mr-2" />
                  Manage Projects
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/uploads">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Version
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

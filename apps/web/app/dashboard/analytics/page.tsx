'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@mcp/ui/components/card';

export default function DashboardAnalyticsPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your mod performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Downloads (30d)', value: '12,458', change: '+23%' },
            { label: 'Views (30d)', value: '45,231', change: '+18%' },
            { label: 'Unique Visitors', value: '8,942', change: '+12%' },
            { label: 'Avg. Rating', value: '4.8', change: '+0.2' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Downloads Over Time</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-lg bg-muted/30">
                <p className="text-muted-foreground text-sm">Chart placeholder</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Projects</CardTitle>
              <CardDescription>By download count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Sodium', 'Lithium', 'Phosphor', 'DashLoader', 'SmoothBoot'].map((mod, i) => (
                  <div key={mod} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">#{i + 1}</span>
                      <span className="font-medium">{mod}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {(Math.random() * 50 + 1).toFixed(1)}K downloads
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

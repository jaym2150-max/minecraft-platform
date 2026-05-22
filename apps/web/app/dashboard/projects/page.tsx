'use client';

import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, Download } from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@mcp/ui/components/card';

const projects = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: ['Sodium', 'Lithium', 'Phosphor', 'Hydrogen', 'DashLoader', 'SmoothBoot', 'Sodium Extra', 'Reese's Sodium Options'][i],
  status: i < 6 ? 'Published' : 'Draft',
  downloads: Math.floor(Math.random() * 50000),
  updated: `${Math.floor(Math.random() * 14) + 1}d ago`,
}));

export default function DashboardProjectsPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-muted-foreground mt-1">Manage your mod projects</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary text-sm">{project.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                          project.status === 'Published'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {project.status}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {project.downloads.toLocaleString()}
                        </span>
                        <span>Updated {project.updated}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

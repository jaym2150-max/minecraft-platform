'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  ArrowUpDown,
  Package,
  Clock,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@mcp/ui/components/card';
import { Input } from '@mcp/ui/components/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@mcp/ui/components/dialog';
import { useDashboardProjects, type DashboardProject } from '@/hooks/use-dashboard';
import { sdk } from '@/services/api';
import { toast } from 'sonner';

type ProjectStatus = 'Published' | 'Draft' | 'Archived';
type SortKey = 'name' | 'downloads' | 'updated';

const statusFilters: { label: string; value: 'all' | ProjectStatus }[] = [
  { label: 'All Projects', value: 'all' },
  { label: 'Published', value: 'Published' },
  { label: 'Drafts', value: 'Draft' },
  { label: 'Archived', value: 'Archived' },
];

export default function DashboardProjectsPage() {
  const { projects, loading, error, refetch } = useDashboardProjects();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [sortAsc, setSortAsc] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DashboardProject | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await sdk.deleteProject(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const filtered = useMemo(() => {
    return projects
      .filter((p) => {
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        const dir = sortAsc ? 1 : -1;
        if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
        if (sortKey === 'downloads') return (a.downloads - b.downloads) * dir;
        return 0;
      });
  }, [projects, statusFilter, search, sortKey, sortAsc]);

  const SortHeader = ({ label, sort }: { label: string; sort: SortKey }) => (
    <button
      onClick={() => toggleSort(sort)}
      className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-medium uppercase tracking-wider transition-colors"
    >
      {label}
      <ArrowUpDown
        className={`h-3 w-3 transition-opacity ${sortKey === sort ? 'opacity-100' : 'opacity-40'}`}
      />
    </button>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your mod projects and versions</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/uploads">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
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

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search projects..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-muted-foreground text-sm font-normal">
            {loading ? (
              'Loading projects...'
            ) : (
              <>
                Showing <strong className="text-foreground">{filtered.length}</strong> of{' '}
                <strong className="text-foreground">{projects.length}</strong> projects
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 pr-4">
                      <SortHeader label="Project" sort="name" />
                    </th>
                    <th className="pb-3 pr-4">
                      <SortHeader label="Downloads" sort="downloads" />
                    </th>
                    <th className="text-muted-foreground pb-3 pr-4 text-xs font-medium uppercase tracking-wider">
                      Status
                    </th>
                    <th className="pb-3 pr-4">
                      <SortHeader label="Updated" sort="updated" />
                    </th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((project) => (
                    <tr
                      key={project.id}
                      className="hover:bg-muted/40 border-b transition-colors last:border-0"
                    >
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="from-primary/20 to-primary/5 ring-border flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm ring-1">
                            <span className="text-primary text-xs font-bold">
                              {project.name[0]}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/mod/${project.slug}`}
                              className="hover:text-primary block truncate font-medium transition-colors"
                            >
                              {project.name}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 font-medium">
                        {project.downloads >= 1000000
                          ? `${(project.downloads / 1000000).toFixed(1)}M`
                          : project.downloads >= 1000
                            ? `${(project.downloads / 1000).toFixed(0)}K`
                            : String(project.downloads)}
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${
                              project.status === 'Published'
                                ? 'bg-emerald-500'
                                : project.status === 'Draft'
                                  ? 'bg-amber-500'
                                  : 'bg-muted-foreground'
                            }`}
                          />
                          <span
                            className={`text-xs font-medium ${
                              project.status === 'Published'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : project.status === 'Draft'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-muted-foreground'
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>
                      </td>
                      <td className="text-muted-foreground whitespace-nowrap py-3.5 pr-4 text-xs">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {project.updated}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/mod/${project.slug}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/dashboard/projects/${project.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive h-8 w-8"
                            onClick={() => setDeleteTarget(project)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="bg-muted mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                <Package className="text-muted-foreground/60 h-7 w-7" />
              </div>
              <h3 className="mb-1 text-lg font-semibold">No projects found</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                {search ? 'Try a different search term' : 'No projects match this filter'}
              </p>
              {(search || statusFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
              {projects.length === 0 && !search && (
                <Button asChild>
                  <Link href="/dashboard/uploads">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Project
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="bg-destructive/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <AlertTriangle className="text-destructive h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Delete Project</DialogTitle>
                <DialogDescription>This action cannot be undone</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <p className="text-muted-foreground mb-6 text-sm">
            Are you sure you want to delete{' '}
            <strong className="text-foreground">{deleteTarget?.name}</strong>? All versions,
            downloads, and associated data will be permanently removed.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2"
            >
              {deleting ? (
                <>
                  <span className="border-destructive-foreground/30 border-t-destructive-foreground h-4 w-4 animate-spin rounded-full border-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

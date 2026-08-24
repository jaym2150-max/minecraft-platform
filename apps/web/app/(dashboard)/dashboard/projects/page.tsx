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
      className="flex items-center gap-1 font-medium text-muted-foreground text-xs uppercase tracking-wider hover:text-foreground transition-colors"
    >
      {label}
      <ArrowUpDown className={`h-3 w-3 transition-opacity ${sortKey === sort ? 'opacity-100' : 'opacity-40'}`} />
    </button>
  );

  return (
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
            <p className="text-muted-foreground mt-1">Manage your mod projects and versions</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/uploads">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-destructive/50">
            <CardContent className="p-4 flex items-center justify-between">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={refetch}>Retry</Button>
            </CardContent>
          </Card>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
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
            <CardTitle className="text-sm text-muted-foreground font-normal">
              {loading ? (
                'Loading projects...'
              ) : (
                <>Showing <strong className="text-foreground">{filtered.length}</strong> of <strong className="text-foreground">{projects.length}</strong> projects</>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
                      <th className="pb-3 pr-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
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
                      <tr key={project.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 shadow-sm ring-1 ring-border">
                              <span className="font-bold text-primary text-xs">{project.name[0]}</span>
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/mod/${project.slug}`}
                                className="font-medium hover:text-primary transition-colors truncate block"
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
                            <div className={`h-1.5 w-1.5 rounded-full ${
                              project.status === 'Published' ? 'bg-emerald-500' :
                              project.status === 'Draft' ? 'bg-amber-500' :
                              'bg-muted-foreground'
                            }`} />
                            <span className={`text-xs font-medium ${
                              project.status === 'Published' ? 'text-emerald-600 dark:text-emerald-400' :
                              project.status === 'Draft' ? 'text-amber-600 dark:text-amber-400' :
                              'text-muted-foreground'
                            }`}>
                              {project.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 text-muted-foreground whitespace-nowrap text-xs">
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
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(project)}>
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
              <div className="text-center py-16">
                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Package className="h-7 w-7 text-muted-foreground/60" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No projects found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {search ? 'Try a different search term' : 'No projects match this filter'}
                </p>
                {(search || statusFilter !== 'all') && (
                  <Button variant="outline" size="sm" onClick={() => { setSearch(''); setStatusFilter('all'); }}>
                    Clear Filters
                  </Button>
                )}
                {projects.length === 0 && !search && (
                  <Button asChild>
                    <Link href="/dashboard/uploads">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Project
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle>Delete Project</DialogTitle>
                <DialogDescription>This action cannot be undone</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-6">
            Are you sure you want to delete <strong className="text-foreground">{deleteTarget?.name}</strong>?
            All versions, downloads, and associated data will be permanently removed.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="gap-2">
              {deleting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-destructive-foreground/30 border-t-destructive-foreground animate-spin" />
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

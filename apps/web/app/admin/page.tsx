'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Shield,
  Users,
  Package,
  Flag,
  BarChart3,
  Download,
  Search,
  Loader2,
  Check,
  X,
  MoreHorizontal,
  Eye,
  Ban,
  UserCheck,
  ChevronDown,
  TrendingUp,

} from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@mcp/ui/components/card';
import { Input } from '@mcp/ui/components/input';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@mcp/auth';
import { useRouter } from 'next/navigation';
import { sdk } from '@/services/api';
import { adminSdk } from '@/services/admin-api';
import { toast } from 'sonner';

type AdminTab = 'overview' | 'projects' | 'users' | 'reports' | 'analytics';

const TABS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'projects', label: 'Projects', icon: Package },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'reports', label: 'Reports', icon: Flag },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
];

const roleBadgeClass = (role: string) => {
  switch (role) {
    case 'OWNER': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    case 'ADMIN': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'MODERATOR': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  }
};

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'banned': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  }
};

const projectStatusBadge = (status: string) => {
  switch (status) {
    case 'PUBLISHED': return { cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Published' };
    case 'SUBMITTED': return { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'Pending' };
    case 'REJECTED': return { cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Rejected' };
    case 'ARCHIVED': return { cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400', label: 'Archived' };
    case 'DRAFT': return { cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400', label: 'Draft' };
    default: return { cls: 'bg-slate-100 text-slate-700', label: status };
  }
};

const reportStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDING': return { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'Pending' };
    case 'RESOLVED': return { cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Resolved' };
    case 'DISMISSED': return { cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400', label: 'Dismissed' };
    default: return { cls: 'bg-slate-100 text-slate-700', label: status };
  }
};

export default function AdminPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [, setUsersMeta] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [, setReportsMeta] = useState<any>(null);
  const [reportStats, setReportStats] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());

  // H-F6: surface server failures on the admin page. The previous handlers
  // wrapped every privileged mutation in `try { await } catch {}`, silently
  // swallowing 403/500s so a permission failure looked identical to success
  // (the optimistic local state had already been flipped). We now record the
  // error message into a state-backed banner and REVERT the optimistic update
  // on failure so the displayed list never goes out of sync with the server.
  const [adminError, setAdminError] = useState<string | null>(null);
  const dismissError = useCallback(() => setAdminError(null), []);

  // H-F6: gate destructive admin actions behind an explicit confirm. The
  // previous `<select onChange>` fired `changeUserRole` the instant the
  // option changed — a stray click promoted USER→OWNER with no way back.
  // Returns true only if the user confirms (also true for non-destructive
  // actions so callers can pass the verb uniformly).
  const confirmDestructive = useCallback((verb: string, subject: string): boolean => {
    return typeof window === 'undefined'
      ? true
      : window.confirm(`${verb} "${subject}"?\n\nThis change cannot be undone from this screen.`);
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await adminSdk.getAdminAnalytics();
      if (res?.data) setAnalytics(res.data);
    } catch { }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const params: any = { page: 1, limit: 50 };
      if (search) params.search = search;
      if (selectedRole !== 'all') params.role = selectedRole;
      const res = await adminSdk.listUsers(params);
      if (res?.data) setUsers(res.data);
      if (res?.meta) setUsersMeta(res.meta);
    } catch { }
  }, [search, selectedRole]);

  const fetchProjects = useCallback(async () => {
    try {
      const params: any = { page: 1, limit: 50 };
      if (statusFilter !== 'all') params.status = statusFilter.toUpperCase();
      if (search) params.q = search;
      const res = await sdk.listProjects(params);
      if (res?.data) {
        const items = Array.isArray(res.data) ? res.data : (res.data as any)?.data ?? [];
        setProjects(items);
      }
    } catch { }
  }, [search, statusFilter]);

  const fetchReports = useCallback(async () => {
    try {
      const params: any = { page: 1, limit: 50 };
      if (statusFilter !== 'all') params.status = statusFilter.toUpperCase();
      const res = await adminSdk.listReports(params);
      if (res?.data) setReports(res.data);
      if (res?.meta) setReportsMeta(res.meta);
    } catch { }
  }, [statusFilter]);

  const fetchReportStats = useCallback(async () => {
    try {
      const res = await adminSdk.getReportStats();
      if (res?.data) setReportStats(res.data);
    } catch { }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchAnalytics(),
      fetchUsers(),
      fetchProjects(),
      fetchReports(),
      fetchReportStats(),
    ]).finally(() => setLoading(false));
  }, [fetchAnalytics, fetchUsers, fetchProjects, fetchReports, fetchReportStats]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'projects') fetchProjects();
    if (activeTab === 'reports') { fetchReports(); fetchReportStats(); }
  }, [activeTab, fetchUsers, fetchProjects, fetchReports, fetchReportStats]);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user && user.role !== 'ADMIN' && user.role !== 'OWNER'))) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const filteredUsers = useMemo(() => {
    if (!users?.length) return [];
    return users.filter((u: any) => {
      if (selectedRole !== 'all' && u.role !== selectedRole) return false;
      if (search && !u.username.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [users, search, selectedRole]);

  const filteredProjects = useMemo(() => {
    if (!projects?.length) return [];
    return projects.filter((p: any) => {
      if (statusFilter !== 'all' && p.status !== statusFilter.toUpperCase()) return false;
      if (search && !p.title?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [projects, search, statusFilter]);

  const filteredReports = useMemo(() => {
    if (!reports?.length) return [];
    return reports.filter((r: any) => {
      if (statusFilter !== 'all' && r.status !== statusFilter.toUpperCase()) return false;
      return true;
    });
  }, [reports, statusFilter]);

  const handleBan = async (userId: string, username?: string) => {
    if (!confirmDestructive('Ban user', username ?? userId)) return;
    try {
      await adminSdk.banUser(userId);
      setUsers((prev: any[]) => prev.map((u: any) => u.id === userId ? { ...u, banned: true } : u));
    } catch (err) {
      // H-F6: previously `catch {}` — a 403 looked like success (optimistic
      // flip already applied). Now surface the failure and revert the row.
      setAdminError(`Failed to ban ${username ?? userId}: ${(err as Error)?.message ?? 'request failed'}`);
      setUsers((prev: any[]) => prev.map((u: any) => u.id === userId ? { ...u, banned: false } : u));
    }
  };

  const handleUnban = async (userId: string, username?: string) => {
    if (!confirmDestructive('Unban user', username ?? userId)) return;
    try {
      await adminSdk.unbanUser(userId);
      setUsers((prev: any[]) => prev.map((u: any) => u.id === userId ? { ...u, banned: false } : u));
    } catch (err) {
      setAdminError(`Failed to unban ${username ?? userId}: ${(err as Error)?.message ?? 'request failed'}`);
      setUsers((prev: any[]) => prev.map((u: any) => u.id === userId ? { ...u, banned: true } : u));
    }
  };

  const handleChangeRole = async (userId: string, role: string, username?: string) => {
    if (!confirmDestructive('Change role to ' + role + ' for user', username ?? userId)) return;
    let prevRole: string | undefined;
    try {
      // Capture the prior role so a failure can revert the <select> value
      // rather than leaving the row showing the optimistic (un-applied) role.
      setUsers((prev: any[]) => {
        const target = prev.find((u) => u.id === userId);
        prevRole = target?.role;
        return prev.map((u: any) => u.id === userId ? { ...u, role } : u);
      });
      await adminSdk.changeUserRole(userId, role);
    } catch (err) {
      setAdminError(`Failed to set ${username ?? userId} role to ${role}: ${(err as Error)?.message ?? 'request failed'}`);
      // Revert to whatever role the row had before the optimistic update.
      setUsers((prev: any[]) =>
        prevRole !== undefined
          ? prev.map((u: any) => u.id === userId ? { ...u, role: prevRole } : u)
          : prev,
      );
    }
  };

  const handleChangeTier = async (userId: string, tier: string, username?: string) => {
    if (!confirmDestructive('Change tier to ' + tier + ' for user', username ?? userId)) return;
    let prevTier: string | undefined;
    try {
      setUsers((prev: any[]) => {
        const target = prev.find((u) => u.id === userId);
        prevTier = target?.creatorTier;
        return prev.map((u: any) => u.id === userId ? { ...u, creatorTier: tier } : u);
      });
      await adminSdk.changeUserTier(userId, tier);
    } catch (err) {
      setAdminError(`Failed to set ${username ?? userId} tier to ${tier}: ${(err as Error)?.message ?? 'request failed'}`);
      setUsers((prev: any[]) =>
        prevTier !== undefined
          ? prev.map((u: any) => u.id === userId ? { ...u, creatorTier: prevTier } : u)
          : prev,
      );
    }
  };

  const handleApproveProject = async (projectId: string, title?: string) => {
    if (!confirmDestructive('Publish project', title ?? projectId)) return;
    try {
      await adminSdk.updateProjectStatus(projectId, 'PUBLISHED');
      setProjects((prev: any[]) => prev.map((p: any) => p.id === projectId ? { ...p, status: 'PUBLISHED' } : p));
    } catch (err) {
      setAdminError(`Failed to publish ${title ?? projectId}: ${(err as Error)?.message ?? 'request failed'}`);
      setProjects((prev: any[]) => prev.map((p: any) => p.id === projectId ? { ...p, status: 'PENDING' } : p));
    }
  };

  const handleRejectProject = async (projectId: string, title?: string) => {
    if (!confirmDestructive('Reject project', title ?? projectId)) return;
    try {
      await adminSdk.updateProjectStatus(projectId, 'REJECTED');
      setProjects((prev: any[]) => prev.map((p: any) => p.id === projectId ? { ...p, status: 'REJECTED' } : p));
    } catch (err) {
      setAdminError(`Failed to reject ${title ?? projectId}: ${(err as Error)?.message ?? 'request failed'}`);
      setProjects((prev: any[]) => prev.map((p: any) => p.id === projectId ? { ...p, status: 'PENDING' } : p));
    }
  };

  const handleToggleFeature = async (projectId: string, featured: boolean, title?: string) => {
    if (!confirmDestructive(featured ? 'Unfeature project' : 'Feature project', title ?? projectId)) return;
    try {
      await adminSdk.updateProjectFeature(projectId, !featured);
      setProjects((prev: any[]) => prev.map((p: any) => p.id === projectId ? { ...p, featured: !featured } : p));
    } catch (err) {
      setAdminError(`Failed to toggle feature on ${title ?? projectId}: ${(err as Error)?.message ?? 'request failed'}`);
      setProjects((prev: any[]) => prev.map((p: any) => p.id === projectId ? { ...p, featured } : p));
    }
  };

  const handleResolveReport = async (reportId: string, status: 'RESOLVED' | 'DISMISSED') => {
    if (!confirmDestructive('Mark report as ' + status, reportId)) return;
    try {
      setReports((prev: any[]) => prev.map((r: any) => r.id === reportId ? { ...r, status } : r));
      await adminSdk.resolveReport(reportId, { status });
      setSelectedReports((prev) => { const n = new Set(prev); n.delete(reportId); return n; });
    } catch (err) {
      setAdminError(`Failed to ${status.toLowerCase()} report ${reportId}: ${(err as Error)?.message ?? 'request failed'}`);
    }
  };

  const toggleSelectReport = (id: string) => {
    setSelectedReports((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const toggleSelectAllReports = (checked: boolean) => {
    if (checked) setSelectedReports(new Set(filteredReports.map((r: any) => r.id)));
    else setSelectedReports(new Set());
  };

  const handleBulkResolve = async (status: 'RESOLVED' | 'DISMISSED') => {
    const ids = Array.from(selectedReports);
    if (ids.length === 0) return;
    if (!confirmDestructive(`Bulk ${status.toLowerCase()} ${ids.length} reports`, `${ids.length} reports`)) return;
    try {
      setReports((prev: any[]) => prev.map((r: any) => ids.includes(r.id) ? { ...r, status } : r));
      await Promise.all(ids.map((id) => adminSdk.resolveReport(id, { status })));
      setSelectedReports(new Set());
      toast.success(`${ids.length} reports ${status.toLowerCase()}`);
    } catch (err) {
      setAdminError(`Bulk ${status.toLowerCase()} failed: ${(err as Error)?.message ?? 'request failed'}`);
      fetchReports();
    }
  };

  const overviewCards = analytics ? [
    { label: 'Total Projects', value: analytics.projects.total.toLocaleString(), change: `+${analytics.newProjectsToday ?? 0} today`, icon: Package, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Total Users', value: analytics.users.total.toLocaleString(), change: `${analytics.users.banned} banned`, icon: Users, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Pending Reports', value: analytics.reports.pending.toLocaleString(), change: `${analytics.reports.total} total`, icon: Flag, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Downloads Today', value: analytics.downloads.today.toLocaleString(), change: `${analytics.downloads.total.toLocaleString()} total`, icon: Download, color: 'text-purple-500 bg-purple-500/10' },
  ] : [];

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated || (user && user.role !== 'ADMIN' && user.role !== 'OWNER')) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You do not have permission to access the admin panel.
            </p>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="border-b bg-gradient-to-b from-primary/5 to-background -mx-6 -mt-6 px-6 pt-6 pb-8 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground">Manage your platform</p>
            </div>
          </div>
        </div>

        {adminError && (
          <div
            role="alert"
            data-testid="admin-error-banner"
            className="mb-4 flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <Shield className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Action failed</p>
              <p className="text-destructive/90">{adminError}</p>
            </div>
            <button
              type="button"
              onClick={dismissError}
              aria-label="Dismiss error"
              className="text-destructive/80 hover:text-destructive"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 border-b">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearch(''); setStatusFilter('all'); }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {overviewCards.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={stat.label}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-xl ${stat.color} flex items-center justify-center shrink-0`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-xs mt-0.5 text-muted-foreground">{stat.change}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Projects by Status</CardTitle>
                    <CardDescription>Current distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics && [
                        { label: 'Published', count: analytics.projects.published, color: 'bg-emerald-500' },
                        { label: 'Pending', count: analytics.projects.pending, color: 'bg-amber-500' },
                        { label: 'Archived', count: analytics.projects.archived, color: 'bg-slate-500' },
                        { label: 'Rejected', count: analytics.projects.rejected, color: 'bg-red-500' },
                      ].map((s) => (
                        <div key={s.label} className="flex items-center gap-3">
                          <div className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                          <span className="text-sm flex-1">{s.label}</span>
                          <span className="text-sm font-medium">{s.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common moderation tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: 'Review Pending Projects', desc: `${analytics?.projects.pending ?? 0} projects awaiting approval`, tab: 'projects' as AdminTab },
                      { label: 'Handle Open Reports', desc: `${analytics?.reports.pending ?? 0} reports need review`, tab: 'reports' as AdminTab },
                      { label: 'View Platform Analytics', desc: 'Traffic and engagement metrics', tab: 'analytics' as AdminTab },
                      { label: 'Manage Users', desc: `${analytics?.users.total ?? 0} registered users`, tab: 'users' as AdminTab },
                    ].map((action) => (
                      <button
                        key={action.label}
                        onClick={() => setActiveTab(action.tab)}
                        className="w-full flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left"
                      >
                        <div>
                          <p className="text-sm font-medium">{action.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground -rotate-90 shrink-0" />
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {!loading && activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search projects..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  {['all', 'published', 'pending', 'rejected', 'archived', 'draft'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setStatusFilter(f)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        statusFilter === f ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-4 font-medium">Title</th>
                          <th className="text-left p-4 font-medium">Author</th>
                          <th className="text-left p-4 font-medium">Downloads</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Featured</th>
                          <th className="text-left p-4 font-medium">Updated</th>
                          <th className="text-right p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredProjects.map((p: any) => {
                          const badge = projectStatusBadge(p.status);
                          return (
                            <tr key={p.id} className="hover:bg-muted/50 transition-colors">
                              <td className="p-4 font-medium">{p.title}</td>
                              <td className="p-4 text-muted-foreground">@{p.author?.username ?? 'unknown'}</td>
                              <td className="p-4">{p.downloads >= 1000000 ? `${(p.downloads / 1000000).toFixed(1)}M` : p.downloads?.toLocaleString() ?? 0}</td>
                              <td className="p-4">
                                <span className={`text-xs px-2 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                              </td>
                              <td className="p-4">
                                <button onClick={() => handleToggleFeature(p.id, p.featured, p.title)} className="cursor-pointer">
                                  {p.featured ? <span className="text-amber-500">★</span> : '—'}
                                </button>
                              </td>
                              <td className="p-4 text-muted-foreground">
                                {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '—'}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                    <Link href={`/mod/${p.slug}`}><Eye className="h-4 w-4" /></Link>
                                  </Button>
                                  {p.status === 'SUBMITTED' && (
                                    <>
                                      <Button
                                        variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                        onClick={() => handleApproveProject(p.id, p.title)}
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                        onClick={() => handleRejectProject(p.id, p.title)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {filteredProjects.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No projects found.</p>
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search users by name or email..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  {['all', 'USER', 'MODERATOR', 'ADMIN', 'OWNER'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRole(r === 'all' ? 'all' : r)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        (r === 'all' && selectedRole === 'all') || selectedRole === r
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {r === 'all' ? 'All' : r.charAt(0) + r.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-4 font-medium">User</th>
                          <th className="text-left p-4 font-medium">Email</th>
                          <th className="text-left p-4 font-medium">Role</th>
                          <th className="text-left p-4 font-medium">Tier</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Joined</th>
                          <th className="text-left p-4 font-medium">Projects</th>
                          <th className="text-right p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredUsers.map((u: any) => (
                          <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                                  {u.username[0].toUpperCase()}
                                </div>
                                <span className="font-medium">@{u.username}</span>
                              </div>
                            </td>
                            <td className="p-4 text-muted-foreground">{u.email}</td>
                            <td className="p-4">
                              <select
                                value={u.role}
                                onChange={(e) => handleChangeRole(u.id, e.target.value, u.username)}
                                className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${roleBadgeClass(u.role)}`}
                              >
                                <option value="USER">USER</option>
                                <option value="MODERATOR">MODERATOR</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="OWNER">OWNER</option>
                              </select>
                            </td>
                            <td className="p-4">
                              <select
                                value={u.creatorTier ?? 'FREE'}
                                onChange={(e) => handleChangeTier(u.id, e.target.value, u.username)}
                                className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer font-medium ${
                                  u.creatorTier === 'PRO' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                  u.creatorTier === 'CREATOR' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                              >
                                <option value="FREE">Free</option>
                                <option value="CREATOR">Creator</option>
                                <option value="PRO">Pro</option>
                              </select>
                            </td>
                            <td className="p-4">
                              <span className={`text-xs px-2 py-1 rounded-full ${u.banned ? statusBadgeClass('banned') : statusBadgeClass('active')}`}>
                                {u.banned ? 'banned' : 'active'}
                              </span>
                            </td>
                            <td className="p-4 text-muted-foreground">{u.joined ?? '—'}</td>
                            <td className="p-4">{u.projects ?? 0}</td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {u.banned ? (
                                  <Button
                                    variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                                    onClick={() => handleUnban(u.id, u.username)}
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    onClick={() => handleBan(u.id, u.username)}
                                  >
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No users found.</p>
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'reports' && (
            <div className="space-y-4">
              {reportStats && (
                <div className="flex gap-4 text-sm">
                  <span>Pending: <strong>{reportStats.pending}</strong></span>
                  <span>Resolved: <strong>{reportStats.resolved}</strong></span>
                  <span>Dismissed: <strong>{reportStats.dismissed}</strong></span>
                  <span>Total: <strong>{reportStats.total}</strong></span>
                </div>
              )}

              <div className="flex gap-2">
                {['all', 'PENDING', 'DISMISSED', 'RESOLVED'].map((f) => (
                  <button
                    key={f}
                    onClick={() => { setStatusFilter(f); setSelectedReports(new Set()); }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      statusFilter === f ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {selectedReports.size > 0 && (
                <div className="flex items-center justify-between rounded-lg border bg-amber-500/5 border-amber-500/20 px-4 py-2">
                  <span className="text-sm font-medium">{selectedReports.size} selected</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => handleBulkResolve('RESOLVED')}>
                      Resolve
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => handleBulkResolve('DISMISSED')}>
                      Dismiss
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => setSelectedReports(new Set())}>
                      Clear
                    </Button>
                  </div>
                </div>
              )}

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-4 w-8">
                            <input
                              type="checkbox"
                              checked={selectedReports.size === filteredReports.length && filteredReports.length > 0}
                              onChange={(e) => toggleSelectAllReports(e.target.checked)}
                              className="h-4 w-4 rounded border-input"
                              aria-label="Select all reports"
                            />
                          </th>
                          <th className="text-left p-4 font-medium">Reason</th>
                          <th className="text-left p-4 font-medium">Project / User</th>
                          <th className="text-left p-4 font-medium">Reporter</th>
                          <th className="text-left p-4 font-medium">Date</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-right p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredReports.map((r: any) => {
                          const badge = reportStatusBadge(r.status);
                          const isSelected = selectedReports.has(r.id);
                          return (
                            <tr key={r.id} className={`hover:bg-muted/50 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                              <td className="p-4">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectReport(r.id)}
                                  className="h-4 w-4 rounded border-input"
                                  aria-label={`Select report ${r.id}`}
                                />
                              </td>
                              <td className="p-4">
                                <div className="font-medium">{r.reason}</div>
                                {r.description && <div className="text-xs text-muted-foreground truncate max-w-[200px]">{r.description}</div>}
                              </td>
                              <td className="p-4 text-sm">
                                {r.projectId ? (
                                  <Link href={`/mod/${r.project?.slug ?? r.projectId}`} className="text-primary hover:underline">
                                    {r.project?.title ?? r.projectId.slice(0, 8)}
                                  </Link>
                                ) : r.reported?.username ? (
                                  <span>@{r.reported.username}</span>
                                ) : r.reportedId ? (
                                  <span className="font-mono text-xs">{r.reportedId.slice(0, 8)}</span>
                                ) : (
                                  '—'
                                )}
                              </td>
                              <td className="p-4 text-muted-foreground text-sm">@{r.reporter?.username ?? 'unknown'}</td>
                              <td className="p-4 text-muted-foreground text-xs">
                                {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                              </td>
                              <td className="p-4">
                                <span className={`text-xs px-2 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex justify-end gap-1">
                                  {r.status === 'PENDING' && (
                                    <>
                                      <Button
                                        variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                                        onClick={() => handleResolveReport(r.id, 'RESOLVED')}
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                        onClick={() => handleResolveReport(r.id, 'DISMISSED')}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {filteredReports.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Flag className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No reports match the selected filter.</p>
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                  { label: 'Total Downloads', value: analytics?.downloads.total?.toLocaleString() ?? '—', change: `${analytics?.downloads.today?.toLocaleString() ?? 0} today` },
                  { label: 'Total Users', value: analytics?.users.total?.toLocaleString() ?? '—', change: `${analytics?.users.banned ?? 0} banned` },
                  { label: 'Total Projects', value: analytics?.projects.total?.toLocaleString() ?? '—', change: `${analytics?.newProjectsToday ?? 0} today` },
                  { label: 'Pending Reports', value: analytics?.reports.pending?.toLocaleString() ?? '—', change: `${analytics?.reports.total ?? 0} total` },
                ].map((stat) => {
                  return (
                    <Card key={stat.label}>
                      <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        <p className="text-xs mt-1 text-muted-foreground">{stat.change}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Projects by Status</CardTitle>
                  <CardDescription>Current distribution across the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics ? (
                    <div className="space-y-3">
                      {[
                        { label: 'Published', count: analytics.projects.published, pct: analytics.projects.total ? Math.round(analytics.projects.published / analytics.projects.total * 100) : 0 },
                        { label: 'Pending', count: analytics.projects.pending, pct: analytics.projects.total ? Math.round(analytics.projects.pending / analytics.projects.total * 100) : 0 },
                        { label: 'Archived', count: analytics.projects.archived, pct: analytics.projects.total ? Math.round(analytics.projects.archived / analytics.projects.total * 100) : 0 },
                        { label: 'Rejected', count: analytics.projects.rejected, pct: analytics.projects.total ? Math.round(analytics.projects.rejected / analytics.projects.total * 100) : 0 },
                      ].map((s) => (
                        <div key={s.label}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>{s.label}</span>
                            <span className="text-muted-foreground">{s.count} ({s.pct}%)</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                s.label === 'Published' ? 'bg-emerald-500' :
                                s.label === 'Pending' ? 'bg-amber-500' :
                                s.label === 'Archived' ? 'bg-slate-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${s.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No analytics data available.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
      </div>
    </DashboardLayout>
  );
}

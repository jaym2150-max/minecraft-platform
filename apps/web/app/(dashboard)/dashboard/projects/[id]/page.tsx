'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Package,
  Download,
  Eye,
  Star,
  Clock,
  ChevronLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  Users,
  Settings,
  Copy,
  Check,
  UserPlus,
  X,
  ExternalLink,
  Edit3,
  MoreHorizontal,
  Fingerprint,
} from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { Badge } from '@mcp/ui/components/badge';
import { Input } from '@mcp/ui/components/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@mcp/ui/components/card';
import { sdk } from '@/services/api';
import { useAuth } from '@mcp/auth';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type Tab = 'overview' | 'versions' | 'team';

interface VersionItem {
  id: string;
  version: string;
  loaders: string[];
  minecraftVersion?: string;
  downloads: number;
  fileSize: number;
  fileUrl: string;
  hash?: string;
  scanStatus?: string;
  status: string;
  changelog?: string;
  createdAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  userId?: string;
  user?: { id: string; username: string; avatarUrl?: string };
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="bg-muted h-6 w-48 rounded-lg" />
      <div className="bg-muted h-10 w-64 rounded-lg" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="bg-muted h-12 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="bg-destructive/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
          <AlertCircle className="text-destructive h-8 w-8" />
        </div>
        <h2 className="mb-2 text-xl font-bold">Error</h2>
        <p className="text-muted-foreground mb-4 text-sm">{message}</p>
        <Button onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
      </div>
    </div>
  );
}

function HashCopy({ hash }: { hash?: string }) {
  const [copied, setCopied] = useState(false);
  if (!hash) return null;
  const short = hash.length > 16 ? `${hash.slice(0, 8)}...${hash.slice(-4)}` : hash;
  return (
    <button
      onClick={() => {
        navigator.clipboard
          .writeText(hash)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => {});
      }}
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-mono text-[10px]"
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <Fingerprint className="h-3 w-3" />
      )}
      {short}
    </button>
  );
}

export default function DashboardProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user: currentUser, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [project, setProject] = useState<any>(null);
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [projectRes, versionsRes, teamRes] = await Promise.allSettled([
        sdk.getProject(id),
        sdk.getProjectVersions(id),
        sdk.getProjectTeam(id),
      ]);
      if (projectRes.status === 'fulfilled') setProject(projectRes.value.data);
      else setError('Failed to load project');
      if (versionsRes.status === 'fulfilled') {
        const vData = versionsRes.value.data ?? [];
        setVersions(
          Array.isArray(vData)
            ? vData.map((v: any) => ({
                ...v,
                loaders: v.loaders ?? [],
                scanStatus: v.scanStatus,
                hash: v.hash,
              }))
            : [],
        );
      }
      if (teamRes.status === 'fulfilled') {
        const tData = teamRes.value.data ?? [];
        setTeam(
          Array.isArray(tData)
            ? tData.map((m: any) => ({
                id: m.id,
                name: m.name ?? m.user?.username ?? 'Unknown',
                role: m.role,
                avatarUrl: m.avatarUrl ?? m.user?.avatarUrl,
                userId: m.userId ?? m.user?.id,
                user: m.user ?? { id: m.userId, username: m.name, avatarUrl: m.avatarUrl },
              }))
            : [],
        );
      }
    } catch {
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const isOwner = isAuthenticated && project?.authorId === currentUser?.id;

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchAll} />;
  if (!project) return <ErrorState message="Project not found" onRetry={fetchAll} />;

  const tabs: { value: Tab; label: string; icon: React.ElementType }[] = [
    { value: 'overview', label: 'Overview', icon: Package },
    { value: 'versions', label: `Versions (${versions.length})`, icon: Download },
    { value: 'team', label: `Team (${team.length})`, icon: Users },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-3 gap-1">
          <Link href="/dashboard/projects">
            <ChevronLeft className="h-4 w-4" /> Back to Projects
          </Link>
        </Button>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="from-primary/20 to-primary/5 ring-border flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm ring-1">
              <span className="text-primary text-xl font-bold">{project.title?.[0]}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{project.title}</h1>
                <Badge
                  variant={project.status === 'PUBLISHED' ? 'secondary' : 'outline'}
                  className="text-[10px]"
                >
                  {project.status}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">/{project.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1" asChild>
              <Link href={`/mod/${project.slug}`}>
                <ExternalLink className="h-4 w-4" /> View Page
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? 'border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <OverviewTab project={project} versions={versions} team={team} />
      )}

      {/* Versions Tab */}
      {activeTab === 'versions' && (
        <VersionsTab
          projectId={id}
          project={project}
          versions={versions}
          isOwner={isOwner}
          onRefresh={fetchAll}
        />
      )}

      {/* Team Tab */}
      {activeTab === 'team' && (
        <TeamTab projectId={id} team={team} isOwner={isOwner} onRefresh={fetchAll} />
      )}
    </div>
  );
}

function OverviewTab({
  project,
  versions,
  team,
}: {
  project: any;
  versions: VersionItem[];
  team: TeamMember[];
}) {
  const totalDownloads = versions.reduce((s: number, v: VersionItem) => s + v.downloads, 0);
  const latestVersion = versions[0];
  const chartData = useMemo(() => {
    return versions
      .slice()
      .reverse()
      .slice(-14)
      .map((v, i) => ({
        name: v.version,
        downloads: v.downloads,
        index: i,
      }));
  }, [versions]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-sm">Total Downloads</p>
            <p className="mt-1 text-2xl font-bold">{totalDownloads.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-sm">Versions</p>
            <p className="mt-1 text-2xl font-bold">{versions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-sm">Team Members</p>
            <p className="mt-1 text-2xl font-bold">{team.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-sm">Latest Version</p>
            <p className="mt-1 text-2xl font-bold">{latestVersion?.version ?? '—'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Download Trends</CardTitle>
          <CardDescription>Downloads per version</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(21 90% 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(21 90% 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
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
                    dataKey="downloads"
                    stroke="hsl(21 90% 55%)"
                    strokeWidth={2}
                    fill="url(#trendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                No version data yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VersionsTab({
  projectId,
  project,
  versions,
  isOwner,
  onRefresh,
}: {
  projectId: string;
  project: any;
  versions: VersionItem[];
  isOwner: boolean;
  onRefresh: () => void;
}) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newVersion, setNewVersion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<VersionItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersion.trim()) return;
    setSubmitting(true);
    try {
      await sdk.createVersion(projectId, { version: newVersion.trim() } as any);
      toast.success('Version created');
      setNewVersion('');
      setShowNewForm(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create version');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await sdk.deleteVersion(projectId, deleteTarget.id);
      toast.success('Version deleted');
      setDeleteTarget(null);
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete version');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{versions.length} total versions</p>
        {isOwner && (
          <Button size="sm" className="gap-1" onClick={() => setShowNewForm(!showNewForm)}>
            <Plus className="h-4 w-4" /> New Version
          </Button>
        )}
      </div>

      {showNewForm && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleCreate} className="flex gap-2">
              <Input
                placeholder="Version number (e.g. 1.0.0)"
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                required
              />
              <Button
                type="submit"
                disabled={!newVersion.trim() || submitting}
                className="shrink-0 gap-1"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowNewForm(false)}>
                Cancel
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {versions.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="text-muted-foreground p-4 text-xs font-medium uppercase">
                    Version
                  </th>
                  <th className="text-muted-foreground hidden p-4 text-xs font-medium uppercase sm:table-cell">
                    Downloads
                  </th>
                  <th className="text-muted-foreground hidden p-4 text-xs font-medium uppercase md:table-cell">
                    Status
                  </th>
                  <th className="text-muted-foreground hidden p-4 text-xs font-medium uppercase lg:table-cell">
                    Hash
                  </th>
                  <th className="text-muted-foreground hidden p-4 text-xs font-medium uppercase sm:table-cell">
                    Created
                  </th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {versions.map((v) => (
                  <tr
                    key={v.id}
                    className="hover:bg-muted/40 border-b transition-colors last:border-0"
                  >
                    <td className="p-4 font-medium">v{v.version}</td>
                    <td className="hidden p-4 sm:table-cell">{v.downloads.toLocaleString()}</td>
                    <td className="hidden p-4 md:table-cell">
                      <Badge
                        variant={
                          v.status === 'APPROVED'
                            ? 'secondary'
                            : v.status === 'REJECTED'
                              ? 'destructive'
                              : 'outline'
                        }
                        className="text-[10px]"
                      >
                        {v.status}
                      </Badge>
                    </td>
                    <td className="hidden p-4 lg:table-cell">
                      <HashCopy hash={v.hash} />
                    </td>
                    <td className="text-muted-foreground hidden p-4 text-xs sm:table-cell">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {isOwner && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive h-7 w-7"
                            onClick={() => setDeleteTarget(v)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="py-16 text-center">
          <div className="bg-muted mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
            <Package className="text-muted-foreground/60 h-7 w-7" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">No versions yet</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Create your first version to start distributing your mod.
          </p>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-xl border p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold">Delete Version</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Delete v{deleteTarget.version}? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                className="gap-2"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamTab({
  projectId,
  team,
  isOwner,
  onRefresh,
}: {
  projectId: string;
  team: TeamMember[];
  isOwner: boolean;
  onRefresh: () => void;
}) {
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteRole, setInviteRole] = useState('DEVELOPER');
  const [inviting, setInviting] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState(false);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUsername.trim()) return;
    setInviting(true);
    try {
      const userRes = await sdk.getUser(inviteUsername.trim());
      const usr = userRes.data;
      const teamData = await sdk.getProjectTeam(projectId);
      const tId = teamData.data?.[0]?.id;
      if (!tId) {
        toast.error('No team found for this project');
        return;
      }
      await sdk.addTeamMember(tId, { userId: usr.id, role: inviteRole });
      toast.success('Team member added');
      setInviteUsername('');
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to invite user');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      const teamData = await sdk.getProjectTeam(projectId);
      const tId = teamData.data?.[0]?.id;
      if (!tId) {
        toast.error('No team found');
        return;
      }
      await sdk.removeTeamMember(tId, removeTarget.id);
      toast.success('Member removed');
      setRemoveTarget(null);
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove member');
    } finally {
      setRemoving(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setChangingRole(memberId);
    try {
      const teamData = await sdk.getProjectTeam(projectId);
      const tId = teamData.data?.[0]?.id;
      if (!tId) {
        toast.error('No team found');
        return;
      }
      await sdk.updateTeamMember(tId, memberId, { role: newRole });
      toast.success('Role updated');
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update role');
    } finally {
      setChangingRole(null);
    }
  };

  return (
    <div className="space-y-6">
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invite Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Username"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                required
                className="flex-1"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="bg-background h-10 rounded-lg border px-3 text-sm"
              >
                <option value="DEVELOPER">Developer</option>
                <option value="ADMIN">Admin</option>
                <option value="CONTRIBUTOR">Contributor</option>
              </select>
              <Button
                type="submit"
                disabled={!inviteUsername.trim() || inviting}
                className="shrink-0 gap-1"
              >
                {inviting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Invite
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team Members ({team.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {team.length > 0 ? (
            <div className="divide-y">
              {team.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="from-primary/20 to-primary/5 text-primary flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold">
                      {member.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <Badge variant="outline" className="mt-0.5 text-[10px]">
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                  {isOwner && (
                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        disabled={changingRole === member.id}
                        className="bg-background h-8 rounded-lg border px-2 text-xs"
                      >
                        <option value="OWNER">Owner</option>
                        <option value="ADMIN">Admin</option>
                        <option value="DEVELOPER">Developer</option>
                        <option value="CONTRIBUTOR">Contributor</option>
                      </select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-7 w-7"
                        onClick={() => setRemoveTarget(member)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center text-sm">No team members</p>
          )}
        </CardContent>
      </Card>

      {removeTarget && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-xl border p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold">Remove Member</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Remove {removeTarget.name} from the team?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setRemoveTarget(null)} disabled={removing}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRemove}
                disabled={removing}
                className="gap-2"
              >
                {removing && <Loader2 className="h-4 w-4 animate-spin" />}Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Download,
  Heart,
  Calendar,
  Github,
  Package,
  Star,
  Clock,
  Eye,
  Shield,
  Users,
  ExternalLink,
  MoreHorizontal,
  AlertCircle,
  Share2,
  TrendingUp,
  Grid3X3,
  List,
  Activity,
  RefreshCw,
  Library,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@mcp/ui/components/button';
import { Badge } from '@mcp/ui/components/badge';
import { Avatar, AvatarFallback } from '@mcp/ui/components/avatar';
import { useUser, type UserProjectData } from '@/hooks/use-user';
import { useAuth } from '@mcp/auth';
import { sdk } from '@/services/api';
import { formatNumber, timeAgo } from '@mcp/utils/helpers';
import type { Collection } from '@mcp/types';

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: string;
}) {
  return (
    <div className="bg-card rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <Icon className="text-primary h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="text-xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p className="mt-0.5 flex items-center gap-0.5 text-xs font-medium text-emerald-500">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const statusColors: Record<string, string> = {
  PUBLISHED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  DRAFT: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  ARCHIVED: 'bg-muted text-muted-foreground',
};

function ProjectCard({ mod }: { mod: UserProjectData }) {
  return (
    <Link
      href={`/mod/${mod.slug}`}
      className="bg-card hover:border-primary/20 group rounded-xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start gap-4">
        <div className="from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 ring-border relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br shadow-sm ring-1 transition-all">
          {mod.iconUrl ? (
            <Image
              src={mod.iconUrl}
              alt={mod.title}
              fill
              sizes="56px"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-primary text-xl font-bold">{mod.title[0]}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="group-hover:text-primary truncate font-semibold transition-colors">
              {mod.title}
            </h3>
            <Badge
              variant="secondary"
              className={`pointer-events-none h-4 px-1.5 text-[10px] ${statusColors[mod.status] ?? ''}`}
            >
              {mod.status === 'PUBLISHED' ? 'Published' : mod.status}
            </Badge>
          </div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
            {mod.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {mod.categoryName && (
              <span className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                {mod.categoryName}
              </span>
            )}
            {mod.loaders.slice(0, 2).map((loader, i) => (
              <span
                key={`${loader}-${i}`}
                className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs font-medium"
              >
                {loader}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="text-muted-foreground mt-4 flex items-center justify-between border-t pt-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Download className="h-3.5 w-3.5" />
            {formatNumber(mod.downloads)}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-amber-500" />
            {formatNumber(mod.views)}
          </span>
        </div>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timeAgo(mod.updatedAt)}
        </span>
      </div>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <main className="flex-1">
      <div className="bg-muted h-48 animate-pulse sm:h-64" />
      <div className="container animate-pulse space-y-6 py-8">
        <div className="-mt-16 flex items-end gap-6">
          <div className="bg-muted-foreground/20 h-24 w-24 shrink-0 rounded-full sm:h-32 sm:w-32" />
          <div className="flex-1 space-y-3">
            <div className="bg-muted h-8 w-48 rounded-lg" />
            <div className="bg-muted h-4 w-72 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card space-y-2 rounded-xl border p-4">
              <div className="bg-muted h-3 w-16 rounded" />
              <div className="bg-muted h-6 w-12 rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function NotFoundState({ username }: { username: string }) {
  return (
    <main className="flex flex-1 items-center justify-center">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="bg-muted mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl">
          <Users className="text-muted-foreground h-10 w-10" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">User Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We could not find a user with the username &quot;<strong>{username}</strong>&quot;.
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link href="/mods">Browse Mods</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="flex flex-1 items-center justify-center">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="bg-destructive/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl">
          <AlertCircle className="text-destructive h-10 w-10" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">Something Went Wrong</h1>
        <p className="text-muted-foreground/70 bg-muted mb-6 rounded-lg p-3 text-sm">{message}</p>
        <Button onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    </main>
  );
}

function CollectionsTab({ userId }: { userId: string }) {
  const { data, isLoading, error, refetch } = useQuery<Collection[]>({
    queryKey: ['collections', 'user', userId],
    queryFn: async () => {
      const res: any = await sdk.listCollections({ userId, limit: 50 });
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      return list as Collection[];
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (error) toast.error(`Failed to load collections: ${(error as Error).message}`);
  }, [error]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card animate-pulse space-y-3 rounded-xl border p-5">
            <div className="bg-muted h-5 w-32 rounded" />
            <div className="bg-muted h-4 w-full rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
          <Library className="text-muted-foreground/60 h-8 w-8" />
        </div>
        <h3 className="mb-1 text-lg font-semibold">No collections yet</h3>
        <p className="text-muted-foreground text-sm">This user has not created any collections.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.map((col) => (
        <Link
          key={col.id}
          href={`/collections/${col.id}`}
          className="bg-card hover:border-primary/20 rounded-xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="from-primary/20 to-primary/5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br">
              <Library className="text-primary h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold">{col.name}</h3>
              {col.description && (
                <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{col.description}</p>
              )}
            </div>
          </div>
          <div className="text-muted-foreground mt-4 flex items-center justify-between border-t pt-3 text-xs">
            <span>{(col as any).projectCount ?? 0} projects</span>
            {!(col as any).isPublic && <Lock className="h-3 w-3" />}
          </div>
        </Link>
      ))}
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case 'create':
      return <Package className="h-4 w-4" />;
    case 'release':
      return <RefreshCw className="h-4 w-4" />;
    case 'review':
      return <Heart className="h-4 w-4 text-red-500" />;
    case 'comment':
      return <Activity className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
}

function ActivityTab({
  userId,
  currentUserId,
}: {
  userId: string | null;
  currentUserId: string | null;
}) {
  const router = useRouter();
  const {
    data: activities,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['followingActivity', currentUserId],
    queryFn: async () => {
      if (!currentUserId) throw new Error('User not logged in');
      const res = await sdk.getFollowingActivity(1, 20);
      return res.data ?? [];
    },
    enabled: !!currentUserId && currentUserId === userId, // Only fetch if viewing own profile
  });

  // Format time ago function
  const timeAgo = (dateString: string): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval} years ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} months ago`;
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} days ago`;
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} hours ago`;
    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} minutes ago`;
    return `${Math.floor(seconds)} seconds ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 border-b py-3">
            <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-1/2 rounded bg-gray-300" />
              <div className="h-3 w-3/4 rounded bg-gray-300" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-destructive">Failed to load activity: {(error as Error).message}</p>
        <div className="mt-6 flex justify-center">
          <button onClick={() => refetch()} className="btn btn-outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
          <Activity className="text-muted-foreground/60 h-8 w-8" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No activity yet</h3>
        <p className="text-muted-foreground text-sm">
          You're not following anyone, or the users you follow haven't had any recent activity.
        </p>
        {currentUserId && userId && currentUserId !== userId && (
          <div className="mt-6">
            <p className="text-muted-foreground mb-2 text-sm">
              To see activity, follow some users and they'll appear here when they upload mods,
              leave reviews, etc.
            </p>
            <button
              onClick={() => {
                router.push('/mods');
              }}
              className="btn btn-outline"
            >
              Browse Mods
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-lg font-semibold">Activity Feed</h3>
        <button onClick={() => refetch()} className="btn btn-outline px-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </button>
      </div>
      {activities.map((activity: any) => (
        <div key={activity.id} className="flex gap-3 border-b py-3 last:border-0">
          <div className="flex flex-col items-center">
            <ActivityIcon type={activity.type} />
            {activity.type !== 'comment' && <div className="bg-border hidden h-4 w-px md:block" />}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-muted-foreground text-xs">{timeAgo(activity.createdAt)}</p>
              </div>
              {activity.metadata && activity.metadata.project && (
                <div className="text-muted-foreground text-xs">
                  <Link href={`/mod/${activity.metadata.project.slug}`}>
                    {activity.metadata.project.title}
                  </Link>
                  {activity.metadata.version && (
                    <span className="text-muted-foreground ml-2 text-xs">
                      v{activity.metadata.version}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

type ProfileTabId = 'projects' | 'collections' | 'activity';

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user, projects, loading, error, notFound, refetch } = useUser(username);
  const [activeTab, setActiveTab] = useState<ProfileTabId>('projects');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const router = useRouter();

  useEffect(() => {
    if (error) toast.error(`Failed to load profile: ${error}`);
  }, [error]);

  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.id && user?.id) {
      const checkFollowStatus = async () => {
        setIsFollowingLoading(true);
        try {
          // Check if current user follows this profile user
          const { data: followingList } = await sdk.getMyFollowing(1, 50); // Get first 50 following
          setIsFollowing(followingList.some((userObj: any) => userObj.id === user.id));
        } catch (error) {
          console.error('Failed to check follow status:', error);
          setIsFollowing(false);
        } finally {
          setIsFollowingLoading(false);
        }
      };

      checkFollowStatus();
    }
  }, [currentUser?.id, user?.id]);

  const handleFollow = async () => {
    if (!currentUser?.id || !user?.id) {
      toast.error('Please log in to follow users');
      return;
    }

    setIsFollowingLoading(true);
    try {
      await sdk.followUser(user.id);
      setIsFollowing(true);
      toast.success(`You are now following ${user.username}`);
    } catch (error: any) {
      console.error('Failed to follow user:', error);
      toast.error(error?.response?.data?.message || 'Failed to follow user');
    } finally {
      setIsFollowingLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser?.id || !user?.id) {
      toast.error('Please log in to unfollow users');
      return;
    }

    setIsFollowingLoading(true);
    try {
      await sdk.unfollowUser(user.id);
      setIsFollowing(false);
      toast.success(`You have unfollowed ${user.username}`);
    } catch (error: any) {
      console.error('Failed to unfollow user:', error);
      toast.error(error?.response?.data?.message || 'Failed to unfollow user');
    } finally {
      setIsFollowingLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (notFound) return <NotFoundState username={username} />;
  if (error || !user) return <ErrorState message={error || 'Unknown error'} onRetry={refetch} />;

  const publishedCount = projects.filter((p) => p.status === 'PUBLISHED').length;
  const followers = (user as any).followerCount ?? 0;
  const following = (user as any).followingCount ?? 0;

  return (
    <main className="flex-1">
      <div className="from-primary/20 via-primary/10 to-primary/5 relative h-48 overflow-hidden bg-gradient-to-r sm:h-64">
        <div className="from-primary/10 absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] via-transparent to-transparent" />
      </div>
      <div className="container">
        <div className="relative -mt-16 mb-8 sm:-mt-20">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:gap-6">
            <Avatar className="ring-background h-24 w-24 shadow-xl ring-4 sm:h-32 sm:w-32">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.username}
                  fill
                  sizes="(min-width:640px) 128px, 96px"
                  className="h-full w-full object-cover"
                />
              ) : null}
              <AvatarFallback className="from-primary/20 to-primary/10 text-primary bg-gradient-to-br text-4xl font-bold sm:text-5xl">
                {user.username?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 pt-4 sm:pb-1 sm:pt-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <h1 className="truncate text-3xl font-bold tracking-tight sm:text-4xl">
                  {user.displayName || user.username}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    {user.role === 'ADMIN'
                      ? 'Admin'
                      : user.role === 'MODERATOR'
                        ? 'Moderator'
                        : user.role === 'OWNER'
                          ? 'Owner'
                          : 'Mod Developer'}
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground mt-1">@{user.username}</p>
              {user.bio && (
                <p className="text-muted-foreground mt-2 max-w-xl text-sm">{user.bio}</p>
              )}
              <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined{' '}
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto sm:pb-1">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard
                      .writeText(window.location.href)
                      .then(() => toast.success('Profile link copied'));
                  }
                }}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 sm:ml-4 sm:mt-0">
          {!isFollowingLoading && !isFollowing && (
            <Button variant="outline" size="sm" onClick={handleFollow} className="gap-2">
              <Users className="h-4 w-4" />
              Follow
            </Button>
          )}
          {!isFollowingLoading && isFollowing && (
            <Button variant="destructive" size="sm" onClick={handleUnfollow} className="gap-2">
              <Users className="h-4 w-4" />
              Unfollow
            </Button>
          )}
          {isFollowingLoading && (
            <Button
              variant="outline"
              size="sm"
              className="pointer-events-opacity-50 gap-2"
              disabled
            >
              <Users className="h-4 w-4" />
              {isFollowing ? 'Unfollowing...' : 'Following...'}
            </Button>
          )}
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={Download}
            label="Total Downloads"
            value={formatNumber(user.totalDownloads)}
          />
          <StatCard
            icon={Package}
            label="Projects"
            value={String(user.projectCount)}
            trend={`${publishedCount} active`}
          />
          <StatCard icon={Users} label="Followers" value={formatNumber(followers)} />
          <StatCard icon={Activity} label="Following" value={formatNumber(following)} />
        </div>

        <div className="mb-8 border-b">
          <nav className="-mb-px flex items-center gap-6" aria-label="Profile sections">
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'projects'
                  ? 'border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              }`}
              aria-current={activeTab === 'projects' ? 'page' : undefined}
            >
              <Grid3X3 className="h-4 w-4" />
              Projects
              <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px]">
                {projects.length}
              </Badge>
            </button>
            <button
              onClick={() => setActiveTab('collections')}
              className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'collections'
                  ? 'border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              }`}
              aria-current={activeTab === 'collections' ? 'page' : undefined}
            >
              <Library className="h-4 w-4" />
              Collections
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'activity'
                  ? 'border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              }`}
              aria-current={activeTab === 'activity' ? 'page' : undefined}
            >
              <Activity className="h-4 w-4" />
              Activity
            </button>
          </nav>
        </div>
        <div className="mt-4 hidden sm:ml-4 sm:mt-0">
          {/* Follow/Unfollow buttons placeholder - moved to header */}
        </div>

        {activeTab === 'projects' && (
          <div className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Showing <strong className="text-foreground">{projects.length}</strong> projects
              </p>
              <div className="flex items-center gap-2">
                <div className="bg-card flex items-center rounded-lg border p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`rounded-md p-1.5 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`rounded-md p-1.5 transition-colors ${
                      viewMode === 'list'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            {projects.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
                    : 'space-y-3'
                }
              >
                {projects.map((mod) => (
                  <ProjectCard key={mod.id} mod={mod} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                  <Package className="text-muted-foreground/60 h-8 w-8" />
                </div>
                <h3 className="mb-1 text-lg font-semibold">No projects yet</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  This user has not published any projects yet.
                </p>
                <Button asChild>
                  <Link href="/mods">Browse Mods</Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'collections' && (
          <div className="mb-12">
            <CollectionsTab userId={user.id} />
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="mb-12">
            <ActivityTab userId={user.id} currentUserId={currentUser?.id ?? null} />
          </div>
        )}
      </div>
    </main>
  );
}

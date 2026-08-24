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
    <div className="rounded-xl border bg-card p-4 hover:shadow-sm transition-all hover:-translate-y-0.5">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p className="flex items-center gap-0.5 text-xs text-emerald-500 font-medium mt-0.5">
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
      className="group rounded-xl border bg-card p-5 hover:shadow-lg transition-all hover:-translate-y-0.5 hover:border-primary/20"
    >
      <div className="flex items-start gap-4">
        <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 group-hover:from-primary/30 group-hover:to-primary/10 transition-all shadow-sm ring-1 ring-border overflow-hidden">
          {mod.iconUrl ? (
            <Image src={mod.iconUrl} alt={mod.title} fill sizes="56px" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-primary">{mod.title[0]}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
              {mod.title}
            </h3>
            <Badge variant="secondary" className={`text-[10px] h-4 px-1.5 pointer-events-none ${statusColors[mod.status] ?? ''}`}>
              {mod.status === 'PUBLISHED' ? 'Published' : mod.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{mod.description}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {mod.categoryName && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                {mod.categoryName}
              </span>
            )}
            {mod.loaders.slice(0, 2).map((loader, i) => (
              <span key={`${loader}-${i}`} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                {loader}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
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
      <div className="h-48 sm:h-64 bg-muted animate-pulse" />
      <div className="container py-8 space-y-6 animate-pulse">
        <div className="flex items-end gap-6 -mt-16">
          <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-muted-foreground/20 shrink-0" />
          <div className="space-y-3 flex-1">
            <div className="h-8 w-48 bg-muted rounded-lg" />
            <div className="h-4 w-72 bg-muted rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
              <div className="h-3 bg-muted rounded w-16" />
              <div className="h-6 bg-muted rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function NotFoundState({ username }: { username: string }) {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <Users className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-2">User Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We could not find a user with the username &quot;<strong>{username}</strong>&quot;.
        </p>
        <div className="flex gap-3 justify-center">
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
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Something Went Wrong</h1>
        <p className="text-sm text-muted-foreground/70 mb-6 bg-muted rounded-lg p-3">{message}</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3 animate-pulse">
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Library className="h-8 w-8 text-muted-foreground/60" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No collections yet</h3>
        <p className="text-sm text-muted-foreground">This user has not created any collections.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((col) => (
        <Link
          key={col.id}
          href={`/collections/${col.id}`}
          className="rounded-xl border bg-card p-5 hover:shadow-lg transition-all hover:-translate-y-0.5 hover:border-primary/20"
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
              <Library className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{col.name}</h3>
              {col.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{col.description}</p>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
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

function ActivityTab({ userId, currentUserId }: { userId: string | null; currentUserId: string | null }) {
  const router = useRouter();
  const { data: activities, isLoading, error, refetch } = useQuery({
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
          <div key={i} className="flex gap-3 py-3 border-b">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-gray-300 rounded w-1/2" />
              <div className="h-3 bg-gray-300 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load activity: {(error as Error).message}</p>
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => refetch()}
            className="btn btn-outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Activity className="h-8 w-8 text-muted-foreground/60" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
        <p className="text-sm text-muted-foreground">
          You're not following anyone, or the users you follow haven't had any recent activity.
        </p>
        {currentUserId && userId && currentUserId !== userId && (
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-2">
              To see activity, follow some users and they'll appear here when they upload mods, leave reviews, etc.
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
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">Activity Feed</h3>
        <button
          onClick={() => refetch()}
          className="btn btn-outline px-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>
      {activities.map((activity: any) => (
        <div key={activity.id} className="flex gap-3 py-3 border-b last:border-0">
          <div className="flex flex-col items-center">
            <ActivityIcon type={activity.type} />
            {activity.type !== 'comment' && (
              <div className="w-px h-4 bg-border hidden md:block" />
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(activity.createdAt)}</p>
              </div>
              {activity.metadata && activity.metadata.project && (
                <div className="text-xs text-muted-foreground">
                  <Link href={`/mod/${activity.metadata.project.slug}`}>
                    {activity.metadata.project.title}
                  </Link>
                  {activity.metadata.version && (
                    <span className="ml-2 text-xs text-muted-foreground">
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
      <div className="h-48 sm:h-64 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      </div>
      <div className="container">
        <div className="relative -mt-16 sm:-mt-20 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 ring-4 ring-background shadow-xl">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt={user.username} fill sizes="(min-width:640px) 128px, 96px" className="h-full w-full object-cover" />
              ) : null}
              <AvatarFallback className="text-4xl sm:text-5xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                {user.username?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 pt-4 sm:pt-0 sm:pb-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight truncate">
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
                <p className="text-sm text-muted-foreground mt-2 max-w-xl">{user.bio}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
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
            <div className="flex items-center gap-2 sm:pb-1 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href).then(() => toast.success('Profile link copied'));
                }
              }}>
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
            <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center gap-3">
              {!isFollowingLoading && !isFollowing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFollow}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  Follow
                </Button>
              )}
              {!isFollowingLoading && isFollowing && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleUnfollow}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  Unfollow
                </Button>
              )}
              {isFollowingLoading && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 pointer-events-opacity-50"
                  disabled
                >
                  <Users className="h-4 w-4" />
                  {isFollowing ? 'Unfollowing...' : 'Following...'}
                </Button>
              )}
            </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard icon={Download} label="Total Downloads" value={formatNumber(user.totalDownloads)} />
          <StatCard
            icon={Package}
            label="Projects"
            value={String(user.projectCount)}
            trend={`${publishedCount} active`}
          />
          <StatCard icon={Users} label="Followers" value={formatNumber(followers)} />
          <StatCard icon={Activity} label="Following" value={formatNumber(following)} />
        </div>
            
        <div className="border-b mb-8">
          <nav className="flex items-center gap-6 -mb-px" aria-label="Profile sections">
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'projects'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              aria-current={activeTab === 'projects' ? 'page' : undefined}
            >
              <Grid3X3 className="h-4 w-4" />
              Projects
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-1">{projects.length}</Badge>
            </button>
            <button
              onClick={() => setActiveTab('collections')}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'collections'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              aria-current={activeTab === 'collections' ? 'page' : undefined}
            >
              <Library className="h-4 w-4" />
              Collections
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'activity'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              aria-current={activeTab === 'activity' ? 'page' : undefined}
            >
              <Activity className="h-4 w-4" />
              Activity
            </button>
          </nav>
        </div>
            <div className="mt-4 sm:mt-0 sm:ml-4 hidden">
              {/* Follow/Unfollow buttons placeholder - moved to header */}
            </div>

        {activeTab === 'projects' && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Showing <strong className="text-foreground">{projects.length}</strong> projects
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg border bg-card p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-colors ${
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
                    className={`p-1.5 rounded-md transition-colors ${
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
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-3'
                }
              >
                {projects.map((mod) => (
                  <ProjectCard key={mod.id} mod={mod} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-muted-foreground/60" />
                </div>
                            <h3 className="text-lg font-semibold mb-1">No projects yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
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

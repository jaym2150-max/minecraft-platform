'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  Download,
  Heart,
  Shield,
  Share2,
  ChevronRight,
  Star,
  AlertTriangle,
  RefreshCw,
  Check,
  BookOpen,
  Plus,
  Loader2,
  Upload,
  Trash2,
  Github,
  ExternalLink,
  FileText,
  ImageIcon,
  Package as PackageIcon,
  History,
  Users,
  GitBranch,
  Tag,
  Clock,
  Eye,
  Fingerprint,
  Flag,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { Badge } from '@mcp/ui/components/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@mcp/ui/components/dialog';
import { Input } from '@mcp/ui/components/input';
import { useProject, type VersionDisplay } from '@/hooks/use-project';
import { useLicense } from '@/hooks/use-browse';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { VersionTable } from '@/components/version-table';
import { formatNumber, timeAgo, formatDate } from '@mcp/utils/helpers';
import { CommentsSection } from './comments-section';
import { ReviewsSection } from './reviews-section';
import { sdk } from '@/services/api';
import { useAuth } from '@mcp/auth';
import { toast } from 'sonner';

function projectTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    MODPACK: 'Modpack',
    RESOURCE_PACK: 'Resource Pack',
    SHADER: 'Shader',
    DATA_PACK: 'Data Pack',
    PLUGIN: 'Plugin',
  };
  return labels[type] || type;
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
      className="text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors"
      title={`SHA-256: ${hash}`}
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

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-card rounded-xl border p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <Icon className="text-primary h-5 w-5" />
        </div>
        <div>
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="text-lg font-bold">{value}</p>
          {sub && <p className="text-muted-foreground mt-0.5 text-xs">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
      <span className="text-muted-foreground w-16 text-xs">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

type TabId =
  | 'description'
  | 'gallery'
  | 'changelog'
  | 'versions'
  | 'dependencies'
  | 'team'
  | 'comments'
  | 'reviews';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'description', label: 'Description', icon: FileText },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  { id: 'changelog', label: 'Changelog', icon: History },
  { id: 'versions', label: 'Versions', icon: GitBranch },
  { id: 'dependencies', label: 'Dependencies', icon: PackageIcon },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'comments', label: 'Comments', icon: MessageSquare },
  { id: 'reviews', label: 'Reviews', icon: Star },
];

function LoadingSkeleton() {
  return (
    <main className="flex-1">
      <section className="from-primary/5 via-primary/[0.02] to-background border-b bg-gradient-to-b">
        <div className="container py-10">
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            <div className="bg-muted h-24 w-24 shrink-0 animate-pulse rounded-2xl" />
            <div className="flex-1 space-y-3">
              <div className="bg-muted h-9 w-64 animate-pulse rounded-lg" />
              <div className="bg-muted h-4 w-48 animate-pulse rounded" />
              <div className="bg-muted h-4 w-full max-w-xl animate-pulse rounded" />
            </div>
          </div>
        </div>
      </section>
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="bg-muted h-12 animate-pulse rounded-lg" />
            <div className="bg-muted h-64 animate-pulse rounded-xl" />
          </div>
          <div className="space-y-6">
            <div className="bg-muted h-48 animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );
}

function NotFoundState({ slug }: { slug: string }) {
  return (
    <main className="flex flex-1 items-center justify-center">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="bg-muted mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl">
          <PackageIcon className="text-muted-foreground h-10 w-10" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">Project Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t find a project with the slug &quot;<strong>{slug}</strong>&quot;.
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
          <AlertTriangle className="text-destructive h-10 w-10" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">Something Went Wrong</h1>
        <p className="text-muted-foreground mb-2">
          We encountered an error while loading this project.
        </p>
        <p className="text-muted-foreground/70 bg-muted mb-6 rounded-lg p-3 text-sm">{message}</p>
        <div className="flex justify-center gap-3">
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/mods">Browse Mods</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

export default function ModDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user: currentUser, isAuthenticated } = useAuth();
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [userCollections, setUserCollections] = useState<any[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [addingToCollection, setAddingToCollection] = useState<string | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('description');
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { project, versions, dependencies, team, relatedMods, loading, error, notFound, refetch } =
    useProject(slug);

  const licenseShortId = (project as any)?.licenseId as string | undefined;
  const { data: license } = useLicense(licenseShortId);

  useEffect(() => {
    if (!slug) return;
    sdk
      .checkFollow(slug)
      .then((res) => {
        setFollowing(res.data?.following ?? false);
      })
      .catch(() => {});
    sdk
      .getProjectFollowers(slug, 1, 1)
      .then((res) => {
        setFollowerCount(res.meta?.total ?? 0);
      })
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (error) toast.error(`Failed to load project: ${error}`);
  }, [error]);

  useEffect(() => {
    if (!collectionOpen || !isAuthenticated) return;
    setCollectionsLoading(true);
    sdk
      .getMyCollections(1, 50)
      .then((res) => {
        setUserCollections(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {})
      .finally(() => setCollectionsLoading(false));
  }, [collectionOpen, isAuthenticated]);

  const handleAddToCollection = async (collectionId: string) => {
    if (!project) return;
    setAddingToCollection(collectionId);
    try {
      await sdk.addProjectToCollection(collectionId, { projectId: project.id });
      toast.success('Added to collection');
      setCollectionOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add to collection');
    } finally {
      setAddingToCollection(null);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newCollectionName.trim() || !project) return;
    setCreatingCollection(true);
    try {
      const res = await sdk.createCollection({ name: newCollectionName.trim() });
      await sdk.addProjectToCollection(res.data.id, { projectId: project.id });
      toast.success('Collection created and project added');
      setCollectionOpen(false);
      setNewCollectionName('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create collection');
    } finally {
      setCreatingCollection(false);
    }
  };

  const isOwner =
    isAuthenticated &&
    project?.id &&
    currentUser?.id &&
    (project as any).authorId === currentUser.id;

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;
    setUploadingGallery(true);
    try {
      await sdk.uploadGalleryImage(slug, file);
      toast.success('Screenshot uploaded');
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload screenshot');
    } finally {
      setUploadingGallery(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm('Delete this screenshot?')) return;
    try {
      await sdk.deleteGalleryItem(id);
      toast.success('Screenshot deleted');
      setActiveScreenshot(0);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete screenshot');
    }
  };

  const handleDownload = async (v: VersionDisplay) => {
    setDownloadingId(v.id);
    try {
      window.open(v.fileUrl, '_blank', 'noopener,noreferrer');
      toast.success(`Downloading v${v.version}`);
    } catch (err: any) {
      toast.error(err?.message || 'Download failed');
    } finally {
      setTimeout(() => setDownloadingId(null), 1000);
    }
  };

  const toggleFollow = async () => {
    if (!isAuthenticated) return;
    setFollowLoading(true);
    try {
      if (following) {
        const res = await sdk.unfollowProject(slug);
        setFollowing(false);
        setFollowerCount(res.data?.followerCount ?? Math.max(0, followerCount - 1));
      } else {
        const res = await sdk.followProject(slug);
        setFollowing(true);
        setFollowerCount(res.data?.followerCount ?? followerCount + 1);
      }
    } catch {
      // silent
    } finally {
      setFollowLoading(false);
    }
  };

  // Share: prefer the native Web Share API (mobile), fall back to clipboard
  const handleShare = async () => {
    const shareData = {
      title: project?.title ?? 'Minecraft Mod',
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard');
        return;
      }
      toast.error('Sharing is not supported on this device');
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard');
      } catch {
        toast.error('Could not share this project');
      }
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (notFound) return <NotFoundState slug={slug} />;
  if (error || !project) return <ErrorState message={error || 'Unknown error'} onRetry={refetch} />;

  const latestVersion = versions[0];
  const galleryImages = project?.galleryImages ?? [];
  const hasGallery = galleryImages.length > 0;
  const projectTags = (project as any).tags as string[] | undefined;
  const mcVersions: string[] =
    (project as any).mcVersions ?? (latestVersion ? [latestVersion.minecraft] : []);

  return (
    <main className="flex-1">
      <section className="from-primary/5 via-primary/[0.02] to-background border-b bg-gradient-to-b">
        <div className="container py-10">
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            <div className="from-primary/20 to-primary/10 ring-border relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br shadow-lg ring-1">
              {project.iconUrl ? (
                <Image
                  src={project.iconUrl}
                  alt={project.title}
                  fill
                  sizes="96px"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-primary text-4xl font-bold">
                  {project.title?.[0]?.toUpperCase() || '?'}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col flex-wrap gap-3 sm:flex-row sm:items-center">
                <h1 className="truncate text-3xl font-bold sm:text-4xl">{project.title}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  {(project as any).projectType && (project as any).projectType !== 'MOD' && (
                    <Badge variant="secondary" className="text-xs">
                      {projectTypeLabel((project as any).projectType)}
                    </Badge>
                  )}
                  {(project as any).status === 'PUBLISHED' && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Check className="h-3 w-3" />
                      Published
                    </Badge>
                  )}
                  {project.loaders.slice(0, 2).map((loader, i) => (
                    <Badge key={`${loader}-${i}`} variant="outline" className="text-xs">
                      {loader}
                    </Badge>
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground mt-1">
                by{' '}
                <Link
                  href={`/user/${project.author.username}`}
                  className="text-foreground hover:text-primary font-medium transition-colors"
                >
                  {project.author.username}
                </Link>
              </p>
              <p className="text-muted-foreground mt-2 line-clamp-2 max-w-2xl text-sm">
                {project.description}
              </p>

              <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <Download className="text-primary h-4 w-4" />
                  <strong className="text-foreground font-semibold">
                    {formatNumber(project.downloads)}
                  </strong>{' '}
                  downloads
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-rose-500" />
                  <strong className="text-foreground font-semibold">
                    {formatNumber(followerCount)}
                  </strong>{' '}
                  followers
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  <strong className="text-foreground font-semibold">
                    {formatNumber(project.views)}
                  </strong>{' '}
                  views
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Updated{' '}
                  <strong className="text-foreground font-semibold">
                    {timeAgo(project.updatedAt)}
                  </strong>
                </span>
              </div>

              {/* Tags */}
              {projectTags && projectTags.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Tag className="text-muted-foreground h-3.5 w-3.5" />
                  {projectTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Compatibility */}
              <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-2 text-xs">
                {mcVersions.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    Minecraft:{' '}
                    <span className="text-foreground font-medium">
                      {mcVersions.slice(0, 4).join(', ')}
                    </span>
                    {mcVersions.length > 4 && ` +${mcVersions.length - 4} more`}
                  </span>
                )}
                {project.loaders.length > 0 && (
                  <span className="ml-2 flex items-center gap-1.5">
                    • Loaders:{' '}
                    <span className="text-foreground font-medium">
                      {project.loaders.join(', ')}
                    </span>
                  </span>
                )}
                {license && (
                  <span className="ml-2 flex items-center gap-1.5">
                    • License:{' '}
                    <Badge variant="outline" className="h-4 gap-1 px-1.5 text-[10px]">
                      <Shield className="h-2.5 w-2.5" />
                      {license.shortId}
                    </Badge>
                  </span>
                )}
              </div>

              {/* Links */}
              {(project as any).sourceUrl ||
              (project as any).wikiUrl ||
              (project as any).discordUrl ||
              (project as any).issuesUrl ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {(project as any).sourceUrl && (
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                      <a
                        href={(project as any).sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="h-3.5 w-3.5" />
                        Source
                      </a>
                    </Button>
                  )}
                  {(project as any).wikiUrl && (
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                      <a href={(project as any).wikiUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Wiki
                      </a>
                    </Button>
                  )}
                  {(project as any).discordUrl && (
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                      <a
                        href={(project as any).discordUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Users className="h-3.5 w-3.5" />
                        Discord
                      </a>
                    </Button>
                  )}
                  {(project as any).issuesUrl && (
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                      <a
                        href={(project as any).issuesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Issues
                      </a>
                    </Button>
                  )}
                </div>
              ) : null}
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto sm:flex-col">
              <Button
                size="lg"
                className="w-full gap-2 sm:w-auto"
                onClick={() => latestVersion && handleDownload(latestVersion)}
              >
                <Download className="h-5 w-5" />
                <span className="sm:hidden">Download</span>
                <span className="hidden sm:inline">Install / Download</span>
              </Button>
              {latestVersion && (
                <span className="text-muted-foreground text-center text-xs">
                  v{latestVersion.version} · {latestVersion.loader}
                </span>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-9 w-9 ${following ? 'border-red-200 text-red-500 hover:text-red-600' : ''}`}
                  disabled={!isAuthenticated || followLoading}
                  onClick={toggleFollow}
                  title={
                    isAuthenticated ? (following ? 'Unfollow' : 'Follow') : 'Sign in to follow'
                  }
                  aria-label={
                    isAuthenticated
                      ? following
                        ? 'Unfollow this project'
                        : 'Follow this project'
                      : 'Sign in to follow'
                  }
                >
                  <Heart className={`h-4 w-4 ${following ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={handleShare}
                  title="Share"
                  aria-label="Share this project"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setCollectionOpen(true)}
                    title="Add to Collection"
                    aria-label="Add to collection"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={collectionOpen} onOpenChange={setCollectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Collection</DialogTitle>
            <DialogDescription>Choose a collection or create a new one.</DialogDescription>
          </DialogHeader>
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {collectionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
              </div>
            ) : userCollections.length > 0 ? (
              userCollections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => handleAddToCollection(col.id)}
                  disabled={addingToCollection === col.id}
                  className="bg-card hover:bg-muted flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors disabled:opacity-50"
                >
                  <BookOpen className="text-primary h-5 w-5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{col.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {col.projectCount ?? 0} projects
                    </p>
                  </div>
                  {addingToCollection === col.id && (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  )}
                </button>
              ))
            ) : (
              <p className="text-muted-foreground py-4 text-center text-sm">
                You don&apos;t have any collections yet.
              </p>
            )}
          </div>
          <div className="border-t pt-4">
            <p className="mb-2 text-sm font-medium">Or create a new collection</p>
            <div className="flex gap-2">
              <Input
                placeholder="Collection name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                maxLength={100}
              />
              <Button
                size="sm"
                onClick={handleCreateAndAdd}
                disabled={!newCollectionName.trim() || creatingCollection}
                className="shrink-0 gap-1"
              >
                {creatingCollection ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create & Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                icon={Download}
                label="Total Downloads"
                value={formatNumber(project.downloads)}
              />
              <StatCard icon={Heart} label="Followers" value={formatNumber(followerCount)} />
              <StatCard icon={Eye} label="Page Views" value={formatNumber(project.views)} />
              <StatCard icon={Clock} label="Last Updated" value={timeAgo(project.updatedAt)} />
            </div>

            {/* Tabs — ARIA tablist/tab/tabpanel with arrow-key navigation */}
            <div className="border-b">
              <nav
                className="-mb-px flex items-center gap-1 overflow-x-auto"
                role="tablist"
                aria-label="Project sections"
                onKeyDown={(e) => {
                  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                  e.preventDefault();
                  const idx = TABS.findIndex((t) => t.id === activeTab);
                  const next =
                    e.key === 'ArrowRight'
                      ? TABS[(idx + 1) % TABS.length]
                      : TABS[(idx - 1 + TABS.length) % TABS.length];
                  setActiveTab(next.id);
                  document.getElementById(`project-tab-${next.id}`)?.focus();
                }}
              >
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`project-tab-${tab.id}`}
                      role="tab"
                      aria-selected={isActive}
                      aria-controls="project-tab-panel"
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'border-primary text-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 border-transparent'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab content */}
            <div
              id="project-tab-panel"
              role="tabpanel"
              aria-labelledby={`project-tab-${activeTab}`}
              className="bg-card rounded-xl border p-6"
            >
              {activeTab === 'description' && (
                <div>
                  {project.body ? (
                    <MarkdownRenderer content={project.body} />
                  ) : (
                    <>
                      <p className="text-muted-foreground mb-4 text-sm">{project.description}</p>
                      <h3 className="mb-2 mt-4 flex items-center gap-2 text-lg font-semibold">
                        <PackageIcon className="text-primary h-5 w-5" />
                        Installation
                      </h3>
                      <ol className="list-decimal space-y-1 pl-5 text-sm">
                        <li>Install the mod loader (Fabric, Forge, or NeoForge)</li>
                        <li>Download the mod file for your Minecraft version</li>
                        <li>
                          Place the .jar file in your <code>mods</code> folder
                        </li>
                        <li>Launch Minecraft and enjoy!</li>
                      </ol>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'gallery' && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Screenshots</h2>
                    {isOwner && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          className="hidden"
                          onChange={handleGalleryUpload}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          disabled={uploadingGallery}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {uploadingGallery ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          Upload
                        </Button>
                      </>
                    )}
                  </div>
                  {hasGallery ? (
                    <div className="space-y-3">
                      <div className="bg-muted group relative aspect-video overflow-hidden rounded-lg border">
                        <Image
                          src={galleryImages[activeScreenshot]?.url}
                          alt={galleryImages[activeScreenshot]?.alt ?? 'Screenshot'}
                          fill
                          sizes="(min-width:1024px) 800px, 100vw"
                          className="h-full w-full object-contain"
                        />
                        {isOwner && (
                          <button
                            onClick={() => handleDeleteGallery(galleryImages[activeScreenshot].id)}
                            className="hover:bg-destructive absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      {galleryImages.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {galleryImages.map((img, i) => (
                            <button
                              key={img.id}
                              onClick={() => setActiveScreenshot(i)}
                              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition-all ${
                                activeScreenshot === i
                                  ? 'ring-primary border-primary ring-2'
                                  : 'hover:border-muted-foreground/30'
                              }`}
                            >
                              <Image
                                src={img.url}
                                alt={img.alt ?? ''}
                                fill
                                sizes="96px"
                                className="h-full w-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground py-8 text-center">
                      <ImageIcon className="mx-auto mb-2 h-10 w-10 opacity-40" />
                      <p className="text-sm">No screenshots available yet</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'changelog' && (
                <div className="space-y-6">
                  {versions.length > 0 ? (
                    versions.map((v) => (
                      <div key={v.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="text-base font-semibold">v{v.version}</h3>
                          {v.minecraft && (
                            <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                              MC {v.minecraft}
                            </Badge>
                          )}
                          <span className="text-muted-foreground ml-auto text-xs">
                            {formatDate(v.updatedAt)}
                          </span>
                        </div>
                        {v.changelog ? (
                          <MarkdownRenderer content={v.changelog} className="text-sm" />
                        ) : (
                          <p className="text-muted-foreground text-sm italic">
                            No changelog provided.
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground py-4 text-center text-sm">
                      No changelog available.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'versions' && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">All Versions</h2>
                    <Badge variant="secondary">{versions.length} total</Badge>
                  </div>
                  <VersionTable
                    versions={versions}
                    onDownload={handleDownload}
                    downloadingId={downloadingId}
                  />
                </div>
              )}

              {activeTab === 'dependencies' && (
                <div>
                  {dependencies.length > 0 ? (
                    <ul className="space-y-2">
                      {dependencies.map((dep) => (
                        <li key={`${dep.slug}-${dep.required}`}>
                          <Link
                            href={`/mod/${dep.slug}`}
                            className="hover:bg-muted/50 bg-card group flex items-center justify-between rounded-lg border p-3 transition-colors"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <PackageIcon className="text-muted-foreground h-5 w-5 shrink-0" />
                              <span className="truncate font-medium">{dep.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={dep.required ? 'default' : 'outline'}
                                className="text-xs"
                              >
                                {dep.required ? 'Required' : 'Optional'}
                              </Badge>
                              <ChevronRight className="text-muted-foreground h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground py-4 text-center text-sm">
                      No dependencies declared.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'team' && (
                <div>
                  {team.length > 0 ? (
                    <ul className="space-y-3">
                      {team.map((member) => (
                        <li
                          key={member.name}
                          className="bg-card flex items-center gap-3 rounded-lg border p-3"
                        >
                          <div className="bg-primary/10 text-primary relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold">
                            {member.avatarUrl ? (
                              <Image
                                src={member.avatarUrl}
                                alt={member.name}
                                fill
                                sizes="40px"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              member.name[0]?.toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-muted-foreground text-xs">{member.role}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground py-4 text-center text-sm">
                      No team information available.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'comments' && <CommentsSection projectId={project.id} />}

              {activeTab === 'reviews' && <ReviewsSection projectId={project.id} />}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card sticky top-20 rounded-xl border p-6">
              <h3 className="mb-4 font-semibold">Download</h3>
              <div className="space-y-3">
                {versions.length > 0 ? (
                  <>
                    <select className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-lg border px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1">
                      <option>Latest: v{latestVersion.version}</option>
                      {versions.slice(1).map((v) => (
                        <option key={v.id}>
                          v{v.version} — {v.loader}
                        </option>
                      ))}
                    </select>
                    <Button
                      className="w-full gap-2"
                      size="lg"
                      onClick={() => latestVersion && handleDownload(latestVersion)}
                    >
                      <Download className="h-5 w-5" />
                      Download
                    </Button>
                    <p className="text-muted-foreground text-center text-xs">
                      {formatNumber(latestVersion.downloadsRaw)}+ downloads
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    No downloads available yet
                  </p>
                )}
              </div>
            </div>

            <div className="bg-card space-y-4 rounded-xl border p-6">
              <h3 className="font-semibold">Project Information</h3>
              <div className="space-y-3 text-sm">
                {project.categoryName && (
                  <InfoRow icon={Tag} label="Category" value={project.categoryName} />
                )}
                {project.loaders.length > 0 && (
                  <InfoRow icon={PackageIcon} label="Loaders" value={project.loaders.join(', ')} />
                )}
                <InfoRow
                  icon={Users}
                  label="Author"
                  value={
                    <Link
                      href={`/user/${project.author.username}`}
                      className="text-primary hover:underline"
                    >
                      {project.author.username}
                    </Link>
                  }
                />
                {(project as any).sourceUrl && (
                  <InfoRow
                    icon={ExternalLink}
                    label="Source"
                    value={
                      <a
                        href={(project as any).sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        GitHub
                      </a>
                    }
                  />
                )}
                <InfoRow
                  icon={Shield}
                  label="License"
                  value={license ? license.shortId : ((project as any).licenseId ?? 'Unknown')}
                />
                <InfoRow icon={Clock} label="Published" value={formatDate(project.createdAt)} />
                <InfoRow icon={Clock} label="Updated" value={timeAgo(project.updatedAt)} />
              </div>
            </div>

            <div className="bg-card rounded-xl border p-6">
              <h3 className="mb-3 font-semibold">Dependencies</h3>
              {dependencies.length > 0 ? (
                <div className="space-y-2">
                  {dependencies.slice(0, 5).map((dep) => (
                    <Link
                      key={`${dep.slug}-${dep.required}`}
                      href={`/mod/${dep.slug}`}
                      className="hover:bg-muted/50 group flex items-center justify-between rounded-lg p-2.5 transition-colors"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <PackageIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                        <span className="truncate text-sm">{dep.name}</span>
                      </div>
                      <Badge
                        variant={dep.required ? 'default' : 'outline'}
                        className="h-4 px-1.5 text-[10px]"
                      >
                        {dep.required ? 'Required' : 'Optional'}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No dependencies</p>
              )}
            </div>

            {team.length > 0 && (
              <div className="bg-card rounded-xl border p-6">
                <h3 className="mb-3 font-semibold">Team</h3>
                <div className="space-y-3">
                  {team.slice(0, 5).map((member) => (
                    <div key={member.name} className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold">
                        {member.avatarUrl ? (
                          <Image
                            src={member.avatarUrl}
                            alt={member.name}
                            fill
                            sizes="32px"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          member.name[0]
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-muted-foreground text-xs">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button variant="ghost" size="sm" className="text-muted-foreground w-full gap-2">
              <Flag className="h-4 w-4" />
              Report Project
            </Button>
          </div>
        </div>

        {relatedMods.length > 0 && (
          <section className="mt-12 border-t pt-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Related Mods</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/mods" className="gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedMods.map((mod) => (
                <Link
                  key={mod.slug}
                  href={`/mod/${mod.slug}`}
                  className="bg-card group rounded-xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 group-hover:bg-primary/20 relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl transition-colors">
                      {mod.iconUrl ? (
                        <Image
                          src={mod.iconUrl}
                          alt={mod.title}
                          fill
                          sizes="48px"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-primary text-lg font-bold">{mod.title[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="group-hover:text-primary truncate text-sm font-semibold transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-1 text-xs">
                        {mod.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

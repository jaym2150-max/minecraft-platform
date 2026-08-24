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
        navigator.clipboard.writeText(hash).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => {});
      }}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      title={`SHA-256: ${hash}`}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Fingerprint className="h-3 w-3" />}
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
    <div className="rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
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
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground text-xs w-16">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

type TabId = 'description' | 'gallery' | 'changelog' | 'versions' | 'dependencies' | 'team' | 'comments' | 'reviews';

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
      <section className="border-b bg-gradient-to-b from-primary/5 via-primary/[0.02] to-background">
        <div className="container py-10">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="h-24 w-24 rounded-2xl bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-9 w-64 bg-muted animate-pulse rounded-lg" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-full max-w-xl bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </section>
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-12 bg-muted animate-pulse rounded-lg" />
            <div className="h-64 bg-muted animate-pulse rounded-xl" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-muted animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );
}

function NotFoundState({ slug }: { slug: string }) {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <PackageIcon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Project Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t find a project with the slug &quot;<strong>{slug}</strong>&quot;.
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
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Something Went Wrong</h1>
        <p className="text-muted-foreground mb-2">
          We encountered an error while loading this project.
        </p>
        <p className="text-sm text-muted-foreground/70 mb-6 bg-muted rounded-lg p-3">{message}</p>
        <div className="flex gap-3 justify-center">
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

  const {
    project,
    versions,
    dependencies,
    team,
    relatedMods,
    loading,
    error,
    notFound,
    refetch,
  } = useProject(slug);

  const licenseShortId = (project as any)?.licenseId as string | undefined;
  const { data: license } = useLicense(licenseShortId);

  useEffect(() => {
    if (!slug) return;
    sdk.checkFollow(slug).then((res) => {
      setFollowing(res.data?.following ?? false);
    }).catch(() => {});
    sdk.getProjectFollowers(slug, 1, 1).then((res) => {
      setFollowerCount(res.meta?.total ?? 0);
    }).catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (error) toast.error(`Failed to load project: ${error}`);
  }, [error]);

  useEffect(() => {
    if (!collectionOpen || !isAuthenticated) return;
    setCollectionsLoading(true);
    sdk.getMyCollections(1, 50).then((res) => {
      setUserCollections(Array.isArray(res.data) ? res.data : []);
    }).catch(() => {}).finally(() => setCollectionsLoading(false));
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
    isAuthenticated && project?.id && currentUser?.id && (project as any).authorId === currentUser.id;

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

  if (loading) return <LoadingSkeleton />;
  if (notFound) return <NotFoundState slug={slug} />;
  if (error || !project) return <ErrorState message={error || 'Unknown error'} onRetry={refetch} />;

  const latestVersion = versions[0];
  const galleryImages = project?.galleryImages ?? [];
  const hasGallery = galleryImages.length > 0;
  const projectTags = (project as any).tags as string[] | undefined;
  const mcVersions: string[] = (project as any).mcVersions ?? (latestVersion ? [latestVersion.minecraft] : []);

  return (
    <main className="flex-1">
      <section className="border-b bg-gradient-to-b from-primary/5 via-primary/[0.02] to-background">
        <div className="container py-10">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 shadow-lg ring-1 ring-border overflow-hidden">
              {project.iconUrl ? (
                <Image src={project.iconUrl} alt={project.title} fill sizes="96px" className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-primary">
                  {project.title?.[0]?.toUpperCase() || '?'}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
                <h1 className="text-3xl sm:text-4xl font-bold truncate">{project.title}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  {(project as any).projectType && (project as any).projectType !== 'MOD' && (
                    <Badge variant="secondary" className="text-xs">
                      {projectTypeLabel((project as any).projectType)}
                    </Badge>
                  )}
                  {(project as any).status === 'PUBLISHED' && (
                    <Badge variant="secondary" className="text-xs gap-1">
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
                  className="text-foreground font-medium hover:text-primary transition-colors"
                >
                  {project.author.username}
                </Link>
              </p>
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl line-clamp-2">
                {project.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Download className="h-4 w-4 text-primary" />
                  <strong className="text-foreground font-semibold">{formatNumber(project.downloads)}</strong>{' '}
                  downloads
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-rose-500" />
                  <strong className="text-foreground font-semibold">{formatNumber(followerCount)}</strong>{' '}
                  followers
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  <strong className="text-foreground font-semibold">{formatNumber(project.views)}</strong>{' '}
                  views
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Updated{' '}
                  <strong className="text-foreground font-semibold">{timeAgo(project.updatedAt)}</strong>
                </span>
              </div>

              {/* Tags */}
              {projectTags && projectTags.length > 0 && (
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  {projectTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Compatibility */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {mcVersions.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    Minecraft:{' '}
                    <span className="font-medium text-foreground">{mcVersions.slice(0, 4).join(', ')}</span>
                    {mcVersions.length > 4 && ` +${mcVersions.length - 4} more`}
                  </span>
                )}
                {project.loaders.length > 0 && (
                  <span className="flex items-center gap-1.5 ml-2">
                    • Loaders:{' '}
                    <span className="font-medium text-foreground">{project.loaders.join(', ')}</span>
                  </span>
                )}
                {license && (
                  <span className="flex items-center gap-1.5 ml-2">
                    • License:{' '}
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5 gap-1">
                      <Shield className="h-2.5 w-2.5" />
                      {license.shortId}
                    </Badge>
                  </span>
                )}
              </div>

              {/* Links */}
              {(project as any).sourceUrl || (project as any).wikiUrl || (project as any).discordUrl || (project as any).issuesUrl ? (
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  {(project as any).sourceUrl && (
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                      <a href={(project as any).sourceUrl} target="_blank" rel="noopener noreferrer">
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
                      <a href={(project as any).discordUrl} target="_blank" rel="noopener noreferrer">
                        <Users className="h-3.5 w-3.5" />
                        Discord
                      </a>
                    </Button>
                  )}
                  {(project as any).issuesUrl && (
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                      <a href={(project as any).issuesUrl} target="_blank" rel="noopener noreferrer">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Issues
                      </a>
                    </Button>
                  )}
                </div>
              ) : null}
            </div>

            <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2" onClick={() => latestVersion && handleDownload(latestVersion)}>
                <Download className="h-5 w-5" />
                <span className="sm:hidden">Download</span>
                <span className="hidden sm:inline">Install / Download</span>
              </Button>
              {latestVersion && (
                <span className="text-xs text-muted-foreground text-center">
                  v{latestVersion.version} · {latestVersion.loader}
                </span>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-9 w-9 ${following ? 'text-red-500 border-red-200 hover:text-red-600' : ''}`}
                  disabled={!isAuthenticated || followLoading}
                  onClick={toggleFollow}
                  title={isAuthenticated ? (following ? 'Unfollow' : 'Follow') : 'Sign in to follow'}
                >
                  <Heart className={`h-4 w-4 ${following ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9" title="Share">
                  <Share2 className="h-4 w-4" />
                </Button>
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setCollectionOpen(true)}
                    title="Add to Collection"
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
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {collectionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : userCollections.length > 0 ? (
              userCollections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => handleAddToCollection(col.id)}
                  disabled={addingToCollection === col.id}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted transition-colors text-left disabled:opacity-50"
                >
                  <BookOpen className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{col.name}</p>
                    <p className="text-xs text-muted-foreground">{col.projectCount ?? 0} projects</p>
                  </div>
                  {addingToCollection === col.id && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                You don&apos;t have any collections yet.
              </p>
            )}
          </div>
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Or create a new collection</p>
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
                className="gap-1 shrink-0"
              >
                {creatingCollection ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create & Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={Download} label="Total Downloads" value={formatNumber(project.downloads)} />
              <StatCard icon={Heart} label="Followers" value={formatNumber(followerCount)} />
              <StatCard icon={Eye} label="Unique Visitors" value={formatNumber(project.views)} />
              <StatCard icon={Clock} label="Last Updated" value={timeAgo(project.updatedAt)} />
            </div>

            {/* Tabs */}
            <div className="border-b">
              <nav className="flex items-center gap-1 overflow-x-auto -mb-px" aria-label="Project sections">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                        isActive
                          ? 'border-primary text-foreground'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab content */}
            <div className="rounded-xl border bg-card p-6">
              {activeTab === 'description' && (
                <div>
                  {project.body ? (
                    <MarkdownRenderer content={project.body} />
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                      <h3 className="text-lg font-semibold mt-4 mb-2 flex items-center gap-2">
                        <PackageIcon className="h-5 w-5 text-primary" />
                        Installation
                      </h3>
                      <ol className="list-decimal pl-5 text-sm space-y-1">
                        <li>Install the mod loader (Fabric, Forge, or NeoForge)</li>
                        <li>Download the mod file for your Minecraft version</li>
                        <li>Place the .jar file in your <code>mods</code> folder</li>
                        <li>Launch Minecraft and enjoy!</li>
                      </ol>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'gallery' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
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
                      <div className="aspect-video rounded-lg overflow-hidden border bg-muted relative group">
                        <Image
                          src={galleryImages[activeScreenshot]?.url}
                          alt={galleryImages[activeScreenshot]?.alt ?? 'Screenshot'}
                          fill
                          sizes="(min-width:1024px) 800px, 100vw"
                          className="w-full h-full object-contain"
                          unoptimized
                        />
                        {isOwner && (
                          <button
                            onClick={() => handleDeleteGallery(galleryImages[activeScreenshot].id)}
                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
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
                              className={`relative h-16 w-24 rounded-lg border overflow-hidden shrink-0 transition-all ${
                                activeScreenshot === i
                                  ? 'ring-2 ring-primary border-primary'
                                  : 'hover:border-muted-foreground/30'
                              }`}
                            >
                              <Image src={img.url} alt={img.alt ?? ''} fill sizes="96px" className="w-full h-full object-cover" unoptimized />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No screenshots available yet</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'changelog' && (
                <div className="space-y-6">
                  {versions.length > 0 ? (
                    versions.map((v) => (
                      <div key={v.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-base font-semibold">v{v.version}</h3>
                          {v.minecraft && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                              MC {v.minecraft}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {formatDate(v.updatedAt)}
                          </span>
                        </div>
                        {v.changelog ? (
                          <MarkdownRenderer
                            content={v.changelog}
                            className="text-sm"
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No changelog provided.</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No changelog available.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'versions' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
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
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group border bg-card"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <PackageIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                              <span className="font-medium truncate">{dep.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={dep.required ? 'default' : 'outline'} className="text-xs">
                                {dep.required ? 'Required' : 'Optional'}
                              </Badge>
                              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
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
                          className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                        >
                          <div className="relative h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0 overflow-hidden">
                            {member.avatarUrl ? (
                              <Image src={member.avatarUrl} alt={member.name} fill sizes="40px" className="h-full w-full object-cover" />
                            ) : (
                              member.name[0]?.toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No team information available.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'comments' && (
                <CommentsSection projectId={project.id} />
              )}

              {activeTab === 'reviews' && (
                <ReviewsSection projectId={project.id} />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 sticky top-20">
              <h3 className="font-semibold mb-4">Download</h3>
              <div className="space-y-3">
                {versions.length > 0 ? (
                  <>
                    <select className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option>Latest: v{latestVersion.version}</option>
                      {versions.slice(1).map((v) => (
                        <option key={v.id}>
                          v{v.version} — {v.loader}
                        </option>
                      ))}
                    </select>
                    <Button className="w-full gap-2" size="lg" onClick={() => latestVersion && handleDownload(latestVersion)}>
                      <Download className="h-5 w-5" />
                      Download
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      {formatNumber(latestVersion.downloadsRaw)}+ downloads
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No downloads available yet
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 space-y-4">
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
                    <Link href={`/user/${project.author.username}`} className="text-primary hover:underline">
                      {project.author.username}
                    </Link>
                  }
                />
                {(project as any).sourceUrl && (
                  <InfoRow
                    icon={ExternalLink}
                    label="Source"
                    value={
                      <a href={(project as any).sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        GitHub
                      </a>
                    }
                  />
                )}
                <InfoRow
                  icon={Shield}
                  label="License"
                  value={license ? license.shortId : (project as any).licenseId ?? 'Unknown'}
                />
                <InfoRow icon={Clock} label="Published" value={formatDate(project.createdAt)} />
                <InfoRow icon={Clock} label="Updated" value={timeAgo(project.updatedAt)} />
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-3">Dependencies</h3>
              {dependencies.length > 0 ? (
                <div className="space-y-2">
                  {dependencies.slice(0, 5).map((dep) => (
                    <Link
                      key={`${dep.slug}-${dep.required}`}
                      href={`/mod/${dep.slug}`}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <PackageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm truncate">{dep.name}</span>
                      </div>
                      <Badge variant={dep.required ? 'default' : 'outline'} className="text-[10px] h-4 px-1.5">
                        {dep.required ? 'Required' : 'Optional'}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No dependencies</p>
              )}
            </div>

            {team.length > 0 && (
              <div className="rounded-xl border bg-card p-6">
                <h3 className="font-semibold mb-3">Team</h3>
                <div className="space-y-3">
                  {team.slice(0, 5).map((member) => (
                    <div key={member.name} className="flex items-center gap-3">
                      <div className="relative h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 overflow-hidden">
                        {member.avatarUrl ? (
                          <Image src={member.avatarUrl} alt={member.name} fill sizes="32px" className="h-full w-full object-cover" />
                        ) : (
                          member.name[0]
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground">
              <Flag className="h-4 w-4" />
              Report Project
            </Button>
          </div>
        </div>

        {relatedMods.length > 0 && (
          <section className="mt-12 pt-8 border-t">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Related Mods</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/mods" className="gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedMods.map((mod) => (
                <Link
                  key={mod.slug}
                  href={`/mod/${mod.slug}`}
                  className="group rounded-xl border bg-card p-5 hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors overflow-hidden">
                      {mod.iconUrl ? (
                        <Image src={mod.iconUrl} alt={mod.title} fill sizes="48px" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-primary">{mod.title[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{mod.description}</p>
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

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpen,
  Download,
  Globe,
  Lock,
  Calendar,
  User,
  Trash2,
  Edit3,
  ChevronLeft,
  AlertCircle,
  RefreshCw,
  Clock,
  Star,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { Badge } from '@mcp/ui/components/badge';
import { Avatar, AvatarFallback } from '@mcp/ui/components/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@mcp/ui/components/dialog';
import { Input } from '@mcp/ui/components/input';
import { useAuth } from '@mcp/auth';
import { useCollection } from '@/hooks/use-collections';
import { sdk } from '@/services/api';
import { formatNumber, timeAgo } from '@mcp/utils/helpers';
import { toast } from 'sonner';

function LoadingSkeleton() {
  return (
    <main className="flex-1">
      <div className="container animate-pulse space-y-6 py-12">
        <div className="bg-muted h-6 w-32 rounded-lg" />
        <div className="bg-muted h-10 w-64 rounded-lg" />
        <div className="bg-muted h-4 w-96 rounded" />
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card space-y-3 rounded-xl border p-5">
              <div className="bg-muted h-5 w-32 rounded" />
              <div className="bg-muted h-4 w-full rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function NotFoundState() {
  return (
    <main className="flex flex-1 items-center justify-center">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="bg-muted mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl">
          <BookOpen className="text-muted-foreground h-10 w-10" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">Collection Not Found</h1>
        <p className="text-muted-foreground mb-6">
          This collection does not exist or has been made private.
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link href="/collections">Browse Collections</Link>
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
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
      </div>
    </main>
  );
}

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user: currentUser, isAuthenticated } = useAuth();
  const { collection, loading, error, notFound, refetch } = useCollection(id);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [removingProjectId, setRemovingProjectId] = useState<string | null>(null);

  const isOwner = isAuthenticated && collection?.userId === currentUser?.id;

  useEffect(() => {
    if (editOpen && collection) {
      setEditName(collection.name);
      setEditDescription(collection.description ?? '');
      setEditIsPublic(collection.isPublic);
    }
  }, [editOpen, collection]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await sdk.deleteCollection(id);
      toast.success('Collection deleted');
      router.push('/collections');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete collection');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const handleRemoveProject = async (projectId: string) => {
    setRemovingProjectId(projectId);
    try {
      await sdk.removeProjectFromCollection(id, projectId);
      toast.success('Project removed');
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove project');
    } finally {
      setRemovingProjectId(null);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (notFound) return <NotFoundState />;
  if (error || !collection)
    return <ErrorState message={error || 'Unknown error'} onRetry={refetch} />;

  return (
    <main className="flex-1">
      <div className="from-primary/5 to-background border-b bg-gradient-to-b">
        <div className="container py-8">
          <Button variant="ghost" size="sm" asChild className="mb-4 gap-1">
            <Link href="/collections">
              <ChevronLeft className="h-4 w-4" /> Back to Collections
            </Link>
          </Button>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{collection.name}</h1>
                <Badge variant="secondary" className="gap-1">
                  {collection.isPublic ? (
                    <Globe className="h-3 w-3" />
                  ) : (
                    <Lock className="h-3 w-3" />
                  )}
                  {collection.isPublic ? 'Public' : 'Private'}
                </Badge>
              </div>
              {collection.description && (
                <p className="text-muted-foreground max-w-xl">{collection.description}</p>
              )}
              <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  by{' '}
                  <Link
                    href={`/user/${collection.user?.username}`}
                    className="hover:text-primary font-medium"
                  >
                    {collection.user?.username ?? 'unknown'}
                  </Link>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Created {new Date(collection.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  {collection.projectCount ?? 0} projects
                </span>
              </div>
            </div>
            {isOwner && (
              <div className="flex shrink-0 items-center gap-2">
                <Button variant="outline" className="gap-2" onClick={() => setEditOpen(true)}>
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive gap-2"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8">
        {collection.projects && collection.projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collection.projects.map((entry: any) => (
              <div
                key={entry.id}
                className="bg-card hover:border-primary/20 group rounded-xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Link href={`/mod/${entry.project.slug}`} className="block">
                  <div className="flex items-start gap-4">
                    <div className="from-primary/20 to-primary/5 ring-border relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br shadow-sm ring-1">
                      {entry.project.iconUrl ? (
                        <Image
                          src={entry.project.iconUrl}
                          alt={entry.project.title}
                          fill
                          sizes="56px"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-primary text-xl font-bold">
                          {entry.project.title[0]}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="group-hover:text-primary truncate font-semibold transition-colors">
                        {entry.project.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-1 text-sm">
                        by {entry.project.author.username}
                      </p>
                      {entry.notes && (
                        <p className="text-muted-foreground/70 mt-1 line-clamp-1 text-xs italic">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="text-muted-foreground mt-4 flex items-center justify-between border-t pt-3 text-xs">
                  <span className="flex items-center gap-1">
                    <Download className="h-3.5 w-3.5" />
                    {formatNumber(entry.project.downloads)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeAgo(entry.addedAt)}
                  </span>
                  {isOwner && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveProject(entry.project.id);
                      }}
                      disabled={removingProjectId === entry.project.id}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      {removingProjectId === entry.project.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
              <BookOpen className="text-muted-foreground/60 h-8 w-8" />
            </div>
            <h3 className="mb-1 text-lg font-semibold">No projects yet</h3>
            <p className="text-muted-foreground mb-4 text-sm">This collection is empty.</p>
            <Button asChild>
              <Link href="/mods">Browse Mods</Link>
            </Button>
          </div>
        )}
      </div>

      <Dialog
        open={editOpen}
        onOpenChange={(v) => {
          setEditOpen(v);
          if (!v) {
            setEditName('');
            setEditDescription('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogDescription>Update the name and description.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editName.trim()) return;
              setEditSubmitting(true);
              try {
                await sdk.updateCollection(id, {
                  name: editName.trim(),
                  description: editDescription.trim() || undefined,
                  isPublic: editIsPublic,
                });
                toast.success('Collection updated');
                setEditOpen(false);
                refetch();
              } catch (err: any) {
                toast.error(err?.message || 'Failed to update collection');
              } finally {
                setEditSubmitting(false);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                maxLength={100}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                maxLength={500}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditIsPublic(!editIsPublic)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${editIsPublic ? 'bg-primary/10 border-primary text-primary' : 'bg-card text-muted-foreground'}`}
              >
                {editIsPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {editIsPublic ? 'Public' : 'Private'}
              </button>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!editName.trim() || editSubmitting} className="gap-2">
                {editSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Collection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{collection.name}&quot;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

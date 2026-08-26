'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Grid3X3,
  Lock,
  Globe,
  MoreHorizontal,
  Trash2,
  Edit3,
  Loader2,
  Search,
} from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { Input } from '@mcp/ui/components/input';
import { Badge } from '@mcp/ui/components/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@mcp/ui/components/dialog';
import { useAuth } from '@mcp/auth';
import { useCollections } from '@/hooks/use-collections';
import { sdk } from '@/services/api';
import { toast } from 'sonner';

function LoadingSkeleton() {
  return (
    <main className="flex-1">
      <section className="from-primary/5 to-background border-b bg-gradient-to-b">
        <div className="container space-y-4 py-12">
          <div className="bg-muted h-8 w-48 animate-pulse rounded-lg" />
          <div className="bg-muted h-4 w-96 animate-pulse rounded" />
        </div>
      </section>
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card space-y-3 rounded-xl border p-5">
              <div className="bg-muted h-5 w-32 animate-pulse rounded" />
              <div className="bg-muted h-4 w-full animate-pulse rounded" />
              <div className="flex gap-2">
                <div className="bg-muted h-4 w-16 animate-pulse rounded" />
              </div>
            </div>
          ))}
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

function CreateCollectionDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await sdk.createCollection({
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
      });
      toast.success('Collection created');
      onOpenChange(false);
      setName('');
      setDescription('');
      onCreated();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create collection');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Collection</DialogTitle>
          <DialogDescription>Group your favorite mods into a curated collection.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Collection"
              required
              maxLength={100}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description (optional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description"
              maxLength={500}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${isPublic ? 'bg-primary/10 border-primary text-primary' : 'bg-card text-muted-foreground'}`}
            >
              {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              {isPublic ? 'Public' : 'Private'}
            </button>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || submitting} className="gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CollectionsPage() {
  const { user, isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const { collections, meta, loading, error, refetch } = useCollections({ page, limit: 24 });
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = searchQuery
    ? collections.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.user?.username.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : collections;

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <main className="flex-1">
      <section className="from-primary/5 to-background border-b bg-gradient-to-b">
        <div className="container py-12">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-2">
              <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
                <BookOpen className="text-primary h-8 w-8" />
                Collections
              </h1>
              <p className="text-muted-foreground text-sm">
                Curated lists of mods and resources from the community
              </p>
            </div>
            {isAuthenticated && (
              <Button onClick={() => setCreateOpen(true)} className="shrink-0 gap-2">
                <Plus className="h-4 w-4" />
                New Collection
              </Button>
            )}
          </div>
          <div className="relative mt-6 max-w-md">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </section>

      <div className="container py-8">
        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.id}`}
                  className="bg-card hover:border-primary/20 group rounded-xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="from-primary/20 to-primary/5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br">
                      <BookOpen className="text-primary h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="group-hover:text-primary truncate font-semibold transition-colors">
                          {collection.name}
                        </h3>
                        {!collection.isPublic && (
                          <Lock className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                        )}
                      </div>
                      {collection.description && (
                        <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                          {collection.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-muted-foreground mt-4 flex items-center justify-between border-t pt-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Grid3X3 className="h-3.5 w-3.5" />
                      {collection.projectCount ?? 0} projects
                    </span>
                    <span>
                      by{' '}
                      <strong className="text-foreground">
                        {collection.user?.username ?? 'unknown'}
                      </strong>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            {meta.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="text-muted-foreground px-4 text-sm">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page >= meta.totalPages}
                  className="gap-1"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center">
            <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
              <BookOpen className="text-muted-foreground/60 h-8 w-8" />
            </div>
            <h3 className="mb-1 text-lg font-semibold">No collections found</h3>
            <p className="text-muted-foreground mb-4 text-sm">Be the first to create one!</p>
            {isAuthenticated && (
              <Button onClick={() => setCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Collection
              </Button>
            )}
          </div>
        )}
      </div>

      <CreateCollectionDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={refetch} />
    </main>
  );
}

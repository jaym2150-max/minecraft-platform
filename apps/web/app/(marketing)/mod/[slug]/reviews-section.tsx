'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Edit3,
  Trash2,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@mcp/ui/components/button';
import { Textarea } from '@mcp/ui/components/textarea';
import { Input } from '@mcp/ui/components/input';
import { Label } from '@mcp/ui/components/label';
import { sdk } from '@/services/api';
import { useAuth } from '@mcp/auth';
import type { Review, ReviewStats } from '@mcp/types';

interface ReviewsSectionProps {
  projectId: string;
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'sm',
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' };
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => onChange?.(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors ${
            star <= (hover || value) ? 'text-amber-400' : 'text-muted-foreground/30'
          }`}
        >
          <Star className={`${sizes[size]} fill-current`} />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({
  projectId,
  initial,
  onDone,
  onCancel,
}: {
  projectId: string;
  initial?: { rating: number; title?: string; body?: string; id?: string };
  onDone: () => void;
  onCancel?: () => void;
}) {
  const [rating, setRating] = useState(initial?.rating || 0);
  const [title, setTitle] = useState(initial?.title || '');
  const [body, setBody] = useState(initial?.body || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      if (initial?.id) {
        await sdk.updateReview(initial.id, { rating, title: title || undefined, body: body || undefined });
        toast.success('Review updated');
      } else {
        await sdk.createReview({ rating, title: title || undefined, body: body || undefined, projectId });
        toast.success('Review submitted');
      }
      onDone();
    } catch (err: any) {
      const msg = err?.message || 'Failed to submit review';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Rating</Label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="review-title">Title (optional)</Label>
        <Input
          id="review-title"
          placeholder="Great mod!"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="review-body">Review (optional)</Label>
        <Textarea
          id="review-body"
          placeholder="Share your experience with this mod..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={4}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Submitting...
            </>
          ) : initial?.id ? (
            'Update Review'
          ) : (
            'Submit Review'
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function ReviewCard({
  review,
  isOwn,
  onEdit,
  onDelete,
  helpfulCount,
  voted,
  onHelpful,
}: {
  review: Review;
  isOwn: boolean;
  onEdit: () => void;
  onDelete: () => void;
  helpfulCount?: number;
  voted?: boolean;
  onHelpful?: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this review?')) return;
    setDeleting(true);
    try {
      await sdk.deleteReview(review.id);
      toast.success('Review deleted');
      onDelete();
    } catch {
      toast.error('Failed to delete review');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 overflow-hidden">
            {review.user?.avatarUrl ? (
              <Image src={review.user.avatarUrl} alt="" fill sizes="32px" className="h-full w-full object-cover" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{review.user?.username || 'Unknown'}</p>
            <p className="text-[10px] text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StarRating value={review.rating} readonly size="sm" />
          {isOwn && (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={onEdit}
                className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {review.title && <p className="text-sm font-semibold">{review.title}</p>}
      {review.body && <p className="text-sm text-muted-foreground">{review.body}</p>}
      <div className="flex items-center gap-3 pt-2 border-t mt-2">
        <button
          onClick={onHelpful}
          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors ${voted ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
          aria-pressed={voted}
        >
          <ThumbsUp className="h-3.5 w-3.5" /> Helpful {helpfulCount ? `(${helpfulCount})` : ''}
        </button>
        <span className="text-xs text-muted-foreground">{helpfulCount ? `${helpfulCount} found helpful` : 'Be first to vote'}</span>
      </div>
    </div>
  );
}

export function ReviewsSection({ projectId }: ReviewsSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'>('newest');
  const [helpful, setHelpful] = useState<Record<string, number>>({});
  const [helpfulVoted, setHelpfulVoted] = useState<Set<string>>(new Set());
  const limit = 10;

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sdk.getProjectReviews(projectId, page, limit);
      setReviews(res.data || []);
      const meta = res.meta;
      if (meta) {
        setTotalPages(meta.totalPages || 1);
        if (meta.stats) setStats(meta.stats);
      }
    } catch {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [projectId, page]);

  const fetchUserReview = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    try {
      const res = await sdk.getProjectReviews(projectId, 1, 100);
      const list: Review[] = res.data ?? [];
      const found = list.find((r) => r.userId === user.id || r.user?.id === user.id);
      setUserReview(found ?? null);
    } catch {}
  }, [projectId, isAuthenticated, user?.id]);

  const sortedReviews = useMemo(() => {
    const arr = [...reviews];
    switch (sortBy) {
      case 'oldest':
        return arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'rating_high':
        return arr.sort((a, b) => b.rating - a.rating);
      case 'rating_low':
        return arr.sort((a, b) => a.rating - b.rating);
      case 'helpful':
        return arr.sort((a, b) => (helpful[b.id] || 0) - (helpful[a.id] || 0));
      default:
        return arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [reviews, sortBy, helpful]);

  const toggleHelpful = (id: string) => {
    if (!isAuthenticated) {
      toast.error('Sign in to vote');
      return;
    }
    setHelpfulVoted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setHelpful((h) => ({ ...h, [id]: Math.max(0, (h[id] || 0) - 1) }));
      } else {
        next.add(id);
        setHelpful((h) => ({ ...h, [id]: (h[id] || 0) + 1 }));
      }
      return next;
    });
  };

  useEffect(() => {
    fetchReviews();
    fetchUserReview();
  }, [fetchReviews, fetchUserReview]);

  const handleReviewDone = () => {
    setShowForm(false);
    setEditingReview(null);
    fetchReviews();
    fetchUserReview();
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-400" />
          Reviews & Ratings
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6" id="reviews-section">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Star className="h-5 w-5 text-amber-400" />
        Reviews & Ratings
      </h2>

      {/* Stats Summary */}
      {stats && stats.count > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6 p-4 rounded-lg bg-muted/30">
          <div className="text-center">
            <p className="text-4xl font-bold">{stats.average.toFixed(1)}</p>
            <div className="flex justify-center mt-1">
              <StarRating value={Math.round(stats.average)} readonly size="sm" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stats.count} review{stats.count !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1 space-y-1 w-full">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.distribution[star] || 0;
              const pct = stats.count > 0 ? (count / stats.count) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-right text-muted-foreground">{star}</span>
                  <Star className="h-3 w-3 text-amber-400 fill-current" />
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* User's Review or Sign In */}
      {isAuthenticated ? (
        userReview && !showForm && !editingReview ? (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Your review:</p>
            <ReviewCard
              review={userReview}
              isOwn
              helpfulCount={helpful[userReview.id] || 0}
              voted={helpfulVoted.has(userReview.id)}
              onHelpful={() => toggleHelpful(userReview.id)}
              onEdit={() => setEditingReview(userReview)}
              onDelete={handleReviewDone}
            />
          </div>
        ) : showForm || editingReview ? (
          <div className="mb-6 p-4 rounded-lg border bg-muted/20">
            <p className="text-sm font-medium mb-3">
              {editingReview ? 'Edit your review' : 'Write a review'}
            </p>
            <ReviewForm
              projectId={projectId}
              initial={
                editingReview
                  ? { id: editingReview.id, rating: editingReview.rating, title: editingReview.title, body: editingReview.body }
                  : undefined
              }
              onDone={handleReviewDone}
              onCancel={() => {
                setShowForm(false);
                setEditingReview(null);
              }}
            />
          </div>
        ) : (
          <div className="mb-4">
            <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
              <Star className="h-4 w-4" />
              Write a Review
            </Button>
          </div>
        )
      ) : (
        <div className="mb-4 text-center py-3 text-sm text-muted-foreground">
          <Button variant="outline" size="sm" asChild className="gap-1.5">
            <Link href="/auth/login">Sign in to leave a review</Link>
          </Button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive mb-4">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Sort + Reviews List */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">{sortedReviews.length} review{sortedReviews.length !== 1 ? 's' : ''}</p>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="h-8 rounded-lg border bg-background px-2 text-xs" aria-label="Sort reviews">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="rating_high">Highest rating</option>
          <option value="rating_low">Lowest rating</option>
          <option value="helpful">Most helpful</option>
        </select>
      </div>
      {sortedReviews.length > 0 ? (
        <div className="space-y-3">
          {sortedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwn={user?.id === review.userId}
              helpfulCount={helpful[review.id] || 0}
              voted={helpfulVoted.has(review.id)}
              onHelpful={() => toggleHelpful(review.id)}
              onEdit={() => {
                setEditingReview(review);
                setShowForm(false);
              }}
              onDelete={handleReviewDone}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No reviews yet. Be the first!</p>
          </div>
        )
      )}

      {/* Loading more */}
      {loading && reviews.length > 0 && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

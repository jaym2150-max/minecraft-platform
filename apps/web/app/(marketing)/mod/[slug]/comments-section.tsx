'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageSquare,
  Edit2,
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
import { timeAgo } from '@mcp/utils/helpers';

interface CommentsSectionProps {
  projectId: string;
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  projectId: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
    role: string;
  };
  replies: Comment[];
}

function CommentActionButtons({
  comment,
  isOwn,
  onEdit,
  onDelete,
  onReply,
}: {
  comment: Comment;
  isOwn: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReply: () => void;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {isOwn && (
        <>
          <button
            onClick={onEdit}
            className="hover:bg-muted text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="hover:bg-muted text-muted-foreground hover:text-destructive rounded p-1 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </>
      )}
      <button
        onClick={onReply}
        className="hover:bg-muted text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Reply
      </button>
    </div>
  );
}

function CommentHeader({ comment }: { comment: Comment }) {
  return (
    <div className="mb-2 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <div className="bg-primary/10 text-primary relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold">
          {comment.author?.avatarUrl ? (
            <Image
              src={comment.author.avatarUrl}
              alt=""
              fill
              sizes="32px"
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{comment.author?.username || 'Unknown'}</p>
          <p className="text-muted-foreground text-[10px]">{timeAgo(comment.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}

function CommentContent({ comment }: { comment: Comment }) {
  return (
    <div className="prose prose-sm max-w-none">
      <p>{comment.content}</p>
    </div>
  );
}

function CommentReplyForm({
  projectId,
  parentId,
  onDone,
  onCancel,
}: {
  projectId: string;
  parentId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      await sdk.createComment({
        content: content.trim(),
        projectId,
        parentId,
      });
      toast.success('Reply posted');
      setContent('');
      onDone();
    } catch (err: any) {
      const msg = err?.message || 'Failed to post reply';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border-t pt-4">
      {error && (
        <div className="border-destructive/50 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <Label>Reply to comment</Label>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your reply..."
        maxLength={2000}
        rows={3}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={submitting || !content.trim()} className="gap-2">
          {submitting ? 'Posting...' : 'Reply'}
        </Button>
      </div>
    </form>
  );
}

function CommentCard({
  comment,
  isOwn,
  depth = 0,
  onEdit,
  onDelete,
  onReply,
  onCancelReply,
}: {
  comment: Comment;
  isOwn: boolean;
  depth?: number;
  onEdit: () => void;
  onDelete: () => void;
  onReply: () => void;
  onCancelReply: () => void;
}) {
  const [replying, setReplying] = useState(false);
  const [replyFormVisible, setReplyFormVisible] = useState(false);
  const { user: authUser } = useAuth();

  const handleEdit = () => {
    onEdit();
    setReplyFormVisible(false);
  };

  const handleDelete = () => {
    if (!confirm('Delete this comment?')) return;
    onDelete();
    setReplyFormVisible(false);
  };

  const handleReply = () => {
    setReplyFormVisible(true);
    setReplying(true);
  };

  const handleCancelReply = () => {
    setReplyFormVisible(false);
    setReplying(false);
    onCancelReply();
  };

  const handleReplyDone = () => {
    setReplyFormVisible(false);
    setReplying(false);
  };

  return (
    <div
      className={`border-b pb-4 last:border-b-0 last:pb-0 ${depth > 0 ? 'border-muted ml-2 border-l-2 pl-4' : ''}`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <CommentHeader comment={comment} />
          <div className="flex items-center gap-2 text-xs">
            <CommentActionButtons
              comment={comment}
              isOwn={isOwn}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReply={handleReply}
            />
          </div>
        </div>
        <CommentContent comment={comment} />
        {replyFormVisible && (
          <CommentReplyForm
            projectId={comment.projectId}
            parentId={comment.id}
            onDone={handleReplyDone}
            onCancel={handleCancelReply}
          />
        )}
        {comment.replies.length > 0 && (
          <div className="border-muted/20 mt-4 border-l-2 pl-4">
            <p className="mb-2 text-sm font-semibold">Replies ({comment.replies.length})</p>
            {comment.replies.map((reply) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                isOwn={reply.authorId === (authUser?.id || '')}
                depth={depth + 1}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReply={handleReply}
                onCancelReply={handleCancelReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentsSection({ projectId }: CommentsSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [submittingNewComment, setSubmittingNewComment] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? db - da : da - db;
    });
  }, [comments, sortOrder]);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sdk.getCommentsByProject(projectId, 1, 50); // Get more comments initially
      setComments(res.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleDeleteComment = async (commentId: string) => {
    try {
      await sdk.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (err: any) {
      const msg = err?.message || 'Failed to delete comment';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment);
    setNewCommentContent(comment.content);
    setShowReplyForm(false);
  };

  const handleUpdateComment = async () => {
    if (!editingComment) return;
    setSubmittingNewComment(true);
    try {
      await sdk.updateComment(editingComment.id, {
        content: newCommentContent.trim(),
      });
      // Update the comment in our state
      setComments((prev) =>
        prev.map((c) =>
          c.id === editingComment.id ? { ...c, content: newCommentContent.trim() } : c,
        ),
      );
      setEditingComment(null);
      setNewCommentContent('');
      toast.success('Comment updated');
    } catch (err: any) {
      const msg = err?.message || 'Failed to update comment';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmittingNewComment(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setNewCommentContent('');
    setShowReplyForm(false);
  };

  const handleNewCommentSubmit = async () => {
    if (!newCommentContent.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    setSubmittingNewComment(true);
    setError('');
    try {
      const newComment = await sdk.createComment({
        content: newCommentContent.trim(),
        projectId,
      });
      setComments((prev) => [newComment, ...prev]);
      setNewCommentContent('');
      toast.success('Comment posted');
    } catch (err: any) {
      const msg = err?.message || 'Failed to post comment';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmittingNewComment(false);
    }
  };

  if (loading && comments.length === 0) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="text-muted-foreground mx-auto mb-4 h-6 w-6 animate-spin" />
        <p className="text-muted-foreground text-sm">Loading comments...</p>
      </div>
    );
  }

  if (error && comments.length === 0) {
    return (
      <div className="py-8 text-center">
        <AlertCircle className="text-destructive mx-auto mb-4 h-6 w-6" />
        <p className="text-destructive text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchComments} className="mt-4 gap-2">
          <Loader2 className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <MessageSquare className="h-5 w-5 text-blue-400" />
          Comments{' '}
          <span className="text-muted-foreground text-sm font-normal">({comments.length})</span>
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="border-input bg-background h-8 rounded-lg border px-2 text-xs"
            aria-label="Sort comments"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          {isAuthenticated && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReplyForm(true)}
              className="gap-2"
            >
              {replyingTo ? 'Replying...' : 'Add Comment'}
            </Button>
          )}
        </div>
      </div>

      {showReplyForm && !replyingTo && (
        <div className="bg-muted/20 mb-4 rounded-lg border p-4">
          <p className="mb-3 text-sm font-medium">Add a comment</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNewCommentSubmit();
            }}
            className="space-y-3"
          >
            {error && (
              <div className="border-destructive/50 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <Label>Comment</Label>
            <Textarea
              value={newCommentContent}
              onChange={(e) => setNewCommentContent(e.target.value)}
              placeholder="What are your thoughts on this mod?"
              maxLength={2000}
              rows={4}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={submittingNewComment || !newCommentContent.trim()}
                className="gap-2"
              >
                {submittingNewComment ? 'Posting...' : 'Post Comment'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {sortedComments.length > 0 ? (
        <div className="space-y-4">
          {sortedComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              isOwn={comment.authorId === (user?.id || '')}
              onEdit={() => handleEditComment(comment)}
              onDelete={() => handleDeleteComment(comment.id)}
              onReply={() => {
                setReplyingTo(comment.id);
                setShowReplyForm(true);
              }}
              onCancelReply={() => {
                setReplyingTo(null);
                setShowReplyForm(false);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <MessageSquare className="mx-auto mb-2 h-10 w-10 opacity-40" />
          <p className="text-muted-foreground text-sm">
            No comments yet. Be the first to share your thoughts!
          </p>
          {isAuthenticated && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReplyForm(true)}
              className="mt-4 gap-2"
            >
              Add a Comment
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

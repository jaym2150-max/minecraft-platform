'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Check,
  CheckCheck,
  Loader2,
  Trash2,
  Inbox,
  AlertTriangle,
  MessageSquare,
  Star,
  Activity,
  Upload,
  Users,
  ShieldAlert,
  Coins,
  FileText,
} from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { Card, CardContent } from '@mcp/ui/components/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '@/services/api';
import { timeAgo } from '@mcp/utils/helpers';

type NotificationType =
  | 'PROJECT_UPDATE'
  | 'VERSION_RELEASE'
  | 'REVIEW'
  | 'COMMENT'
  | 'FOLLOW'
  | 'TEAM_INVITE'
  | 'MODERATION'
  | 'PAYOUT'
  | 'SYSTEM'
  | string;

const ICONS: Record<string, any> = {
  PROJECT_UPDATE: Activity,
  VERSION_RELEASE: Upload,
  REVIEW: Star,
  COMMENT: MessageSquare,
  FOLLOW: Users,
  TEAM_INVITE: Users,
  MODERATION: ShieldAlert,
  PAYOUT: Coins,
  SYSTEM: Bell,
};

const TYPE_COLORS: Record<string, string> = {
  PROJECT_UPDATE: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  VERSION_RELEASE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  REVIEW: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  COMMENT: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  FOLLOW: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  TEAM_INVITE: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  MODERATION: 'bg-red-500/10 text-red-600 dark:text-red-400',
  PAYOUT: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  SYSTEM: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
};

const FILTERS: { id: string; label: string; filter: (n: any) => boolean }[] = [
  { id: 'all', label: 'All', filter: () => true },
  { id: 'unread', label: 'Unread', filter: (n) => !n.read },
  { id: 'releases', label: 'Releases', filter: (n) => n.type === 'VERSION_RELEASE' },
  { id: 'reviews', label: 'Reviews', filter: (n) => n.type === 'REVIEW' },
  { id: 'mod', label: 'Moderation', filter: (n) => n.type === 'MODERATION' },
];

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const limit = 20;

  const unreadOnly = filter === 'unread';
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', { page, unreadOnly }],
    queryFn: async () => {
      const res: any = await sdk.listNotifications({ page, limit, unread: unreadOnly });
      return res;
    },
  });

  const { data: countData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => sdk.getUnreadNotificationCount(),
    refetchInterval: 60_000,
  });
  const unreadCount = (countData as any)?.data?.count ?? 0;

  const list: any[] = Array.isArray((data as any)?.data)
    ? (data as any).data
    : Array.isArray(data)
      ? (data as any)
      : [];
  const total: number = (data as any)?.meta?.total ?? list.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const markReadMut = useMutation({
    mutationFn: async (id: string) => sdk.markNotificationRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllMut = useMutation({
    mutationFn: async () => sdk.markAllNotificationsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => sdk.deleteNotification(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const clearAllMut = useMutation({
    mutationFn: async () => sdk.clearAllNotifications(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Apply client-side filter on top of server-side unreadOnly when not 'unread'
  const activeFilter = FILTERS.find((f) => f.id === filter) ?? FILTERS[0];
  const filtered = list.filter(activeFilter.filter);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Bell className="h-6 w-6" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground ml-1 rounded-full px-2 py-0.5 text-xs">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Updates, reviews, releases and moderation events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllMut.mutate()}
            disabled={markAllMut.isPending || unreadCount === 0}
          >
            <CheckCheck className="mr-1.5 h-4 w-4" /> Mark all read
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (window.confirm('Clear every notification? This cannot be undone.')) {
                clearAllMut.mutate();
              }
            }}
            disabled={clearAllMut.isPending || list.length === 0}
          >
            <Trash2 className="mr-1.5 h-4 w-4" /> Clear all
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setFilter(f.id);
              setPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.id
                ? 'bg-primary text-primary-foreground'
                : 'border bg-white hover:bg-slate-50'
            }`}
          >
            {f.label}
            {f.id === 'unread' && unreadCount > 0 && (
              <span className="ml-1 text-xs opacity-80">({unreadCount})</span>
            )}
          </button>
        ))}
        <Button variant="ghost" size="sm" onClick={() => refetch()} className="ml-auto">
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {(error as Error).message ?? 'Failed to load notifications'}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground flex flex-col items-center gap-2 py-16 text-center">
            <Inbox className="h-10 w-10" />
            <p className="text-sm">No notifications here yet.</p>
            <p className="text-xs">Updates on your projects will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <ul className="divide-y rounded-lg border bg-white">
          {filtered.map((n) => {
            const Icon = ICONS[n.type as NotificationType] ?? Bell;
            const color = TYPE_COLORS[n.type as NotificationType] ?? TYPE_COLORS.SYSTEM;
            const content = (
              <div className="flex items-start gap-3 px-4 py-3">
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${n.read ? 'font-normal' : 'font-semibold'}`}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span
                        className="bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        aria-label="Unread"
                      />
                    )}
                  </div>
                  {n.body && <p className="text-muted-foreground mt-0.5 text-xs">{n.body}</p>}
                  <p className="text-muted-foreground/60 mt-1 text-[11px]">
                    {n.createdAt ? timeAgo(n.createdAt) : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!n.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => markReadMut.mutate(n.id)}
                      aria-label="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive h-8 w-8"
                    onClick={() => deleteMut.mutate(n.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
            return (
              <li key={n.id} className={n.read ? '' : 'bg-blue-50/40'}>
                {n.link ? (
                  <Link
                    href={n.link}
                    onClick={() => {
                      if (!n.read) markReadMut.mutate(n.id);
                    }}
                    className="hover:bg-muted/40 block"
                  >
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-muted-foreground">
            Page {page} of {totalPages} · {total} total
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
  );
}

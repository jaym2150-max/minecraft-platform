'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, Loader2, Inbox } from 'lucide-react';
import { useAuth } from '@mcp/auth';
import { sdk } from '@/services/api';
import { timeAgo } from '@mcp/utils/helpers';

interface InboxNotification {
  id: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

const MAX_DROPDOWN = 6;

export function NotificationBell() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const ref = useRef<HTMLDivElement>(null);

  const { data: countData, isFetched: countFetched } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => sdk.getUnreadNotificationCount(),
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });
  const unread = (countData as any)?.data?.count ?? 0;

  const { data, isLoading } = useQuery<InboxNotification[]>({
    queryKey: ['notifications', 'inbox'],
    queryFn: async () => {
      const res: any = await sdk.listNotifications({ limit: MAX_DROPDOWN });
      const list = Array.isArray((res as any)?.data)
        ? (res as any).data
        : Array.isArray(res)
          ? res
          : [];
      return list;
    },
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });
  const items = (data ?? []) as InboxNotification[];

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

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', close);
      document.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('mousedown', close);
        document.removeEventListener('keydown', onKey);
      };
    }
  }, [open]);

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        className="hover:bg-muted relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
      >
        <Bell className="h-4 w-4" />
        {countFetched && unread > 0 && (
          <span className="bg-primary text-primary-foreground absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Notifications"
          className="bg-popover absolute right-0 z-50 mt-2 w-80 rounded-xl border p-1 shadow-lg"
        >
          <div className="flex items-center justify-between border-b px-3 py-2">
            <p className="text-sm font-semibold">Notifications</p>
            <button
              onClick={() => markAllMut.mutate()}
              disabled={markAllMut.isPending || unread === 0}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs disabled:opacity-40"
            >
              <CheckCheck className="h-3 w-3" /> Mark all read
            </button>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {isLoading ? (
              <div className="text-muted-foreground flex items-center justify-center py-8 text-xs">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : items.length === 0 ? (
              <div className="text-muted-foreground flex flex-col items-center gap-1 py-8 text-xs">
                <Inbox className="h-5 w-5" />
                You&apos;re all caught up.
              </div>
            ) : (
              <ul className="divide-y">
                {items.map((n) => (
                  <li
                    key={n.id}
                    className={`flex items-start gap-2 px-3 py-2 ${n.read ? '' : 'bg-blue-50/40'}`}
                  >
                    <div className="min-w-0 flex-1">
                      {n.link ? (
                        <Link
                          href={n.link}
                          onClick={() => {
                            if (!n.read) markReadMut.mutate(n.id);
                            setOpen(false);
                          }}
                          className="block"
                        >
                          <p
                            className={`truncate text-sm ${n.read ? 'font-normal' : 'font-semibold'}`}
                          >
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="text-muted-foreground line-clamp-2 text-xs">{n.body}</p>
                          )}
                          <p className="text-muted-foreground/60 mt-0.5 text-[11px]">
                            {timeAgo(n.createdAt)}
                          </p>
                        </Link>
                      ) : (
                        <>
                          <p
                            className={`truncate text-sm ${n.read ? 'font-normal' : 'font-semibold'}`}
                          >
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="text-muted-foreground line-clamp-2 text-xs">{n.body}</p>
                          )}
                          <p className="text-muted-foreground/60 mt-0.5 text-[11px]">
                            {timeAgo(n.createdAt)}
                          </p>
                        </>
                      )}
                    </div>
                    {!n.read && (
                      <button
                        onClick={() => markReadMut.mutate(n.id)}
                        className="text-muted-foreground hover:text-foreground shrink-0 rounded p-1"
                        aria-label="Mark as read"
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-t p-1">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="hover:bg-muted block rounded-lg px-3 py-2 text-center text-sm font-medium"
            >
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

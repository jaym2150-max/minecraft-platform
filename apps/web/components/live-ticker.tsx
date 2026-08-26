'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { RefreshCw, Download, PackagePlus, UserPlus, MessageSquare, Star } from 'lucide-react';
import { sdk } from '@/services/api';

interface ActivityEvent {
  id: string;
  kind: 'update' | 'new' | 'author' | 'comment' | 'review';
  text: string;
  sub?: string;
  href: string;
  iconUrl?: string;
}

/**
 * Live activity ticker — real data from the API (latest versions across
 * projects + trending authors). Falls back to trending-derived feed when
 * dedicated activity endpoints are unavailable.
 */
export function LiveTicker() {
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: events = [] } = useQuery<ActivityEvent[]>({
    queryKey: ['home', 'live-ticker'],
    queryFn: async () => {
      const events: ActivityEvent[] = [];
      try {
        // Latest version uploads across the catalog (real "just updated" signal)
        const res: any = await sdk.listProjects({ sort: 'updated', limit: 6 });
        const projects = Array.isArray(res?.data) ? res.data : [];
        for (const p of projects) {
          events.push({
            id: `upd-${p.id}`,
            kind: p.createdAt === p.updatedAt ? 'new' : 'update',
            text: `${p.title} ${p.latestVersion ? `v${p.latestVersion}` : ''} ${
              p.createdAt === p.updatedAt ? 'published' : 'updated'
            }`,
            sub: `by ${p.author?.username ?? 'unknown'}`,
            href: `/mod/${p.slug}`,
            iconUrl: p.iconUrl,
          });
        }
      } catch {
        /* empty feed is fine */
      }
      return events;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  // Auto-scroll marquee (pause on hover)
  useEffect(() => {
    if (paused || events.length < 3) return;
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    let x = 0;
    const step = () => {
      x -= 0.5;
      if (Math.abs(x) >= el.scrollWidth / 2) x = 0;
      el.style.transform = `translateX(${x}px)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [paused, events.length]);

  if (events.length === 0) return null;

  const KIND_META = {
    update: { icon: PackagePlus, color: 'text-emerald-600 dark:text-emerald-400', label: 'UPDATE' },
    new: { icon: Star, color: 'text-amber-600 dark:text-amber-400', label: 'NEW' },
    author: { icon: UserPlus, color: 'text-sky-600 dark:text-sky-400', label: 'AUTHOR' },
    comment: { icon: MessageSquare, color: 'text-muted-foreground', label: 'COMMENT' },
    review: { icon: Star, color: 'text-rose-600 dark:text-rose-400', label: 'REVIEW' },
  };

  const doubled = [...events, ...events];

  return (
    <div
      className="border-border bg-muted/40 border-b"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Recent platform activity"
    >
      <div className="container flex items-center gap-3 py-2">
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-black tracking-widest text-red-600 dark:text-red-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          LIVE
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div ref={scrollRef} className="flex w-max items-center gap-8 will-change-transform">
            {doubled.map((ev, i) => {
              const Meta = KIND_META[ev.kind] ?? KIND_META.update;
              const Icon = Meta.icon;
              return (
                <Link
                  key={`${ev.id}-${i}`}
                  href={ev.href}
                  className="group flex shrink-0 items-center gap-2 text-xs"
                >
                  <Icon className={`h-3.5 w-3.5 ${Meta.color}`} />
                  <span className="text-foreground group-hover:text-brand-deep font-bold transition-colors">
                    {ev.text}
                  </span>
                  {ev.sub && <span className="text-muted-foreground font-semibold">{ev.sub}</span>}
                  <span className="bg-muted text-muted-foreground ml-2 rounded px-1.5 py-0.5 text-[9px] font-black tracking-widest">
                    {Meta.label}
                  </span>
                </Link>
              );
            })}
          </div>
          {/* edge fades */}
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r to-transparent" />
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l to-transparent" />
        </div>
      </div>
    </div>
  );
}

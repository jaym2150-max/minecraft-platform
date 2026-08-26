'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Crown,
  Download,
  Star,
  Dice5,
  ArrowRight,
  ChevronDown,
  Users,
  Mail,
  MessageCircle,
  Github,
  Flame,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { sdk } from '@/services/api';
import { formatNumber } from '@mcp/utils/helpers';

/* Mod-of-the-week / version-filter / author-spotlight / community bands.
   All surfaces use semantic theme tokens (bg-card, border-border,
   text-foreground...) so they render correctly in both light and dark
   mode — the previous hardcoded zinc/void-black palette rendered as
   black slabs floating on a white page in light mode. */

/* ─────────────────────────  MOD OF THE WEEK  ───────────────────────── */

function weekIndex(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.floor((now.getTime() - start.getTime()) / (7 * 864e5));
}

export function ModOfTheWeek() {
  const { data: pick } = useQuery({
    queryKey: ['home', 'motw'],
    queryFn: async () => {
      const res: any = await sdk.listProjects({ sort: 'downloads', limit: 20 });
      const list = Array.isArray(res?.data) ? res.data : [];
      // deterministic weekly rotation — same mod all week, changes next week
      return list.length ? list[weekIndex() % Math.min(list.length, 10)] : null;
    },
    staleTime: 3600_000,
  });

  if (!pick) return null;
  const nextWeek = new Date(Date.now() + (7 - new Date().getDay()) * 864e5);

  return (
    <section className="border-border relative overflow-hidden border-b">
      <div className="from-brand/15 via-brand/5 absolute inset-0 bg-gradient-to-r to-transparent" />
      <div
        className="absolute -right-20 top-0 h-full w-1/3 opacity-20"
        style={{
          background:
            'radial-gradient(ellipse at center right, hsl(21 90% 55% / 0.55), transparent 70%)',
        }}
      />
      <div className="container relative flex flex-col items-start gap-6 py-6 md:flex-row md:items-center">
        <div className="border-brand/40 bg-brand/10 flex shrink-0 items-center gap-2 rounded-full border px-4 py-2">
          <Crown className="text-brand-deep h-4 w-4" />
          <span className="text-brand-deep text-xs font-black tracking-[0.18em]">
            MOD OF THE WEEK
          </span>
        </div>
        <Link href={`/mod/${pick.slug}`} className="group flex min-w-0 flex-1 items-center gap-4">
          <div className="bg-muted ring-brand/50 relative h-16 w-16 shrink-0 overflow-hidden rounded-[12px] shadow-[0_0_30px_hsl(21_90%_55%/0.25)] ring-2">
            {pick.iconUrl ? (
              <Image
                src={pick.iconUrl}
                alt={pick.title}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <div className="text-foreground flex h-full w-full items-center justify-center text-xl font-black">
                {pick.title[0]}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-foreground group-hover:text-brand-deep truncate text-lg font-black tracking-tight transition-colors">
              {pick.title}
            </h3>
            <p className="text-muted-foreground line-clamp-1 text-sm">{pick.description}</p>
          </div>
          <div className="hidden shrink-0 items-center gap-4 sm:flex">
            <span className="text-foreground inline-flex items-center gap-1.5 text-sm font-black">
              <Download className="text-brand-deep h-4 w-4" />
              {formatNumber(pick.downloads)}
            </span>
            <ArrowRight className="text-muted-foreground group-hover:text-foreground h-5 w-5 transition-all group-hover:translate-x-1" />
          </div>
        </Link>
        <span className="text-muted-foreground hidden shrink-0 items-center gap-1.5 text-[11px] font-bold tracking-widest lg:inline-flex">
          <Calendar className="h-3.5 w-3.5" /> NEW PICK{' '}
          {nextWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </section>
  );
}

/* ────────────────────  MC VERSION QUICK FILTER  ──────────────────── */

export function VersionFilterBar() {
  const router = useRouter();
  const { data: versions = [] } = useQuery({
    queryKey: ['home', 'mc-versions'],
    queryFn: async () => {
      const res: any = await sdk.listMinecraftVersions();
      const data = Array.isArray(res?.data) ? res.data : [];
      return data
        .filter((v: any) => v.stable !== false)
        .sort((a: any, b: any) => b.version.localeCompare(a.version, undefined, { numeric: true }))
        .slice(0, 8);
    },
    staleTime: 3600_000,
  });

  if (versions.length === 0) return null;

  return (
    <section className="border-border bg-muted/40 border-b py-4">
      <div className="container flex flex-wrap items-center gap-3">
        <span className="text-muted-foreground text-xs font-black tracking-[0.18em]">
          PLAYING A SPECIFIC VERSION?
        </span>
        <div className="flex flex-wrap gap-2">
          {versions.map((v: any) => (
            <button
              key={v.id ?? v.version}
              onClick={() => router.push(`/mods?gameVersions=${v.version}`)}
              className="border-border bg-card text-foreground/80 hover:border-brand/50 hover:bg-brand/10 hover:text-brand-deep group inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-black transition-colors"
            >
              {v.version}
              <ChevronDown className="h-3 w-3 opacity-40" />
            </button>
          ))}
          <Link
            href="/mods"
            className="text-brand-deep hover:bg-brand/10 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-black tracking-widest"
          >
            BROWSE ALL <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────  RANDOM MOD DISCOVERY  ────────────────────── */

export function RandomModButton() {
  const router = useRouter();
  const [rolling, setRolling] = useState(false);
  const { data: pool } = useQuery({
    queryKey: ['home', 'random-pool'],
    queryFn: async () => {
      const res: any = await sdk.listProjects({ limit: 50 });
      return Array.isArray(res?.data) ? res.data : [];
    },
    staleTime: 300_000,
  });

  const roll = () => {
    if (!pool || pool.length === 0) return;
    setRolling(true);
    // quick slot-machine shuffle for delight
    let spins = 0;
    const iv = setInterval(() => {
      const rand = pool[Math.floor(Math.random() * pool.length)];
      document.title = `${rand.title} — Minecraft Platform`;
      if (++spins >= 8) {
        clearInterval(iv);
        router.push(`/mod/${rand.slug}`);
      }
    }, 70);
  };

  return (
    <button
      onClick={roll}
      disabled={rolling || !pool?.length}
      className="border-border bg-card text-foreground/80 hover:border-brand hover:text-foreground hover:bg-brand/5 group inline-flex h-[48px] items-center gap-2.5 rounded-[10px] border border-dashed px-6 text-sm font-black tracking-wide transition-all disabled:opacity-40"
    >
      <Dice5
        className={`text-brand-deep h-5 w-5 ${rolling ? 'animate-spin' : 'transition-transform group-hover:rotate-12'}`}
      />
      {rolling ? 'ROLLING…' : 'SURPRISE ME'}
    </button>
  );
}

/* ────────────────────────  AUTHOR SPOTLIGHTS  ──────────────────────── */

export function AuthorSpotlights() {
  interface AuthorAgg {
    username: string;
    downloads: number;
    count: number;
    icon?: string;
    top?: string;
  }
  const { data: authors = [] } = useQuery<AuthorAgg[]>({
    queryKey: ['home', 'top-authors'],
    queryFn: async (): Promise<AuthorAgg[]> => {
      const res: any = await sdk.listProjects({ sort: 'downloads', limit: 30 });
      const projects = Array.isArray(res?.data) ? res.data : [];
      // aggregate by author
      const map = new Map<string, AuthorAgg>();
      for (const p of projects) {
        const name = p.author?.username;
        if (!name) continue;
        const cur: AuthorAgg = map.get(name) ?? {
          username: name,
          downloads: 0,
          count: 0,
          top: p.slug,
        };
        cur.downloads += p.downloads ?? 0;
        cur.count += 1;
        cur.icon = cur.icon ?? p.iconUrl;
        map.set(name, cur);
      }
      return Array.from(map.values())
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, 4);
    },
    staleTime: 300_000,
  });

  if (authors.length === 0) return null;

  return (
    <section className="border-border bg-muted/40 border-y py-10">
      <div className="container">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-foreground flex items-center gap-3 text-xl font-black tracking-tight sm:text-2xl">
              <span className="bg-primary text-primary-foreground inline-flex h-7 w-7 items-center justify-center rounded-full">
                <Users className="h-4 w-4" />
              </span>
              TOP AUTHORS THIS WEEK
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              The creators behind your favorite mods — follow them for updates.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {authors.map((a, i) => (
            <Link
              key={a.username}
              href={`/user/${a.username}`}
              className="border-border bg-card hover:border-brand/40 group relative overflow-hidden rounded-[14px] border p-5 transition-colors"
            >
              {i === 0 && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[9px] font-black tracking-widest text-amber-600 dark:text-amber-400">
                  <Flame className="h-3 w-3" /> #1
                </span>
              )}
              <div className="bg-muted ring-border group-hover:ring-brand/60 relative mb-3 h-12 w-12 overflow-hidden rounded-full ring-2 transition-all">
                {a.icon ? (
                  <Image src={a.icon} alt={a.username} fill sizes="48px" className="object-cover" />
                ) : (
                  <div className="text-foreground flex h-full w-full items-center justify-center text-base font-black">
                    {a.username[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <h3 className="text-foreground group-hover:text-brand-deep truncate text-sm font-black tracking-tight">
                @{a.username}
              </h3>
              <p className="text-muted-foreground mt-0.5 text-xs font-semibold">
                {a.count} project{a.count > 1 ? 's' : ''}
              </p>
              <p className="text-muted-foreground mt-2 inline-flex items-center gap-1 text-xs font-bold">
                <Download className="text-muted-foreground/70 h-3.5 w-3.5" />
                {formatNumber(a.downloads)} total
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────  NEWSLETTER / DISCORD CTA  ───────────────────── */

export function CommunityBand() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);
  // Dead-link guard: render community buttons only when configured, never '#'
  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_URL;
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL;

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    try {
      const res = await fetch('/api/v1/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setDone(true);
      else setError(true);
    } catch {
      setError(true);
    }
  };

  return (
    <section className="border-border bg-card relative overflow-hidden border-y py-12">
      {/* grid texture */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute -left-24 bottom-0 h-64 w-96 rounded-full bg-[#5865F2]/10 blur-[80px]" />
      <div className="bg-brand/10 absolute -right-24 top-0 h-64 w-96 rounded-full blur-[80px]" />

      <div className="container relative grid gap-10 md:grid-cols-2">
        {/* Newsletter */}
        <div>
          <span className="bg-muted text-muted-foreground border-border inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black tracking-widest">
            <Mail className="text-brand-deep h-3 w-3" /> WEEKLY DIGEST
          </span>
          <h3 className="text-foreground mt-4 text-xl font-black tracking-tight sm:text-2xl">
            THE BEST MODS.
            <br />
            EVERY FRIDAY.
          </h3>
          <p className="text-muted-foreground mt-2 max-w-md text-sm leading-6">
            Top trending mods, hidden gems and author interviews — straight to your inbox. No spam,
            unsubscribe anytime.
          </p>
          {done ? (
            <p className="mt-5 inline-flex items-center gap-2 rounded-[10px] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-400">
              You&apos;re in! Check your inbox Friday.
            </p>
          ) : (
            <form className="mt-5 flex max-w-md gap-2" onSubmit={subscribe}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(false);
                }}
                placeholder="you@example.com"
                aria-label="Email address"
                className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-brand focus:ring-brand/20 h-[46px] min-w-0 flex-1 rounded-[10px] border px-4 text-sm focus:outline-none focus:ring-4"
              />
              <Button
                type="submit"
                className="bg-foreground text-background h-[46px] rounded-[10px] px-6 text-sm font-black tracking-wide hover:opacity-90"
              >
                SUBSCRIBE
              </Button>
            </form>
          )}
          {error && !done && (
            <p className="text-destructive mt-2 text-xs">
              Something went wrong — please try again.
            </p>
          )}
        </div>

        {/* Community */}
        {(discordUrl || githubUrl) && (
          <div className="flex flex-col justify-center md:items-end">
            <div className="border-border bg-muted/40 w-full max-w-md rounded-[16px] border p-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#5865F2] text-white shadow-[0_8px_24px_rgba(88,101,242,0.35)]">
                  <MessageCircle className="h-6 w-6" />
                </span>
                <div>
                  <h4 className="text-foreground text-base font-black tracking-tight">
                    JOIN THE COMMUNITY
                  </h4>
                  <p className="text-muted-foreground text-xs font-semibold">
                    Daily showcases and author support
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground mt-4 text-sm leading-6">
                Get help installing mods, share your builds, and talk directly with authors. Daily
                mod showcases and early beta access.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {discordUrl && (
                  <Button
                    asChild
                    size="sm"
                    className="rounded-full bg-[#5865F2] px-5 font-black tracking-wide text-white hover:bg-[#6873f5]"
                  >
                    <a
                      href={discordUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-1.5"
                    >
                      JOIN SERVER <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
                {githubUrl && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground/80 hover:bg-accent hover:text-foreground rounded-full bg-transparent font-black tracking-wide"
                  >
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-1.5"
                    >
                      <Github className="h-3.5 w-3.5" /> STAR ON GITHUB
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Crown, Download, Star, Dice5, ArrowRight, ChevronDown, Users, Mail, MessageCircle,
  Github, Flame, Calendar, ExternalLink,
} from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { sdk } from '@/services/api';
import { formatNumber } from '@mcp/utils/helpers';

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
    <section className="relative overflow-hidden border-b border-zinc-800">
      <div className="absolute inset-0 bg-gradient-to-r from-[#ff6a1a]/15 via-[#ff6a1a]/5 to-transparent" />
      <div className="absolute -right-20 top-0 h-full w-1/3 opacity-20" style={{ background: 'radial-gradient(ellipse at center right, #ff6a1a55, transparent 70%)' }} />
      <div className="relative container flex flex-col items-start gap-6 py-6 md:flex-row md:items-center">
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#ff6a1a]/40 bg-[#ff6a1a]/10 px-4 py-2">
          <Crown className="h-4 w-4 text-[#ff8c42]" />
          <span className="text-xs font-black tracking-[0.18em] text-[#ffb27a]">MOD OF THE WEEK</span>
        </div>
        <Link href={`/mod/${pick.slug}`} className="group flex min-w-0 flex-1 items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[12px] bg-zinc-800 ring-2 ring-[#ff6a1a]/50 shadow-[0_0_30px_rgba(255,106,26,0.25)]">
            {pick.iconUrl ? (
              <Image src={pick.iconUrl} alt={pick.title} fill sizes="64px" className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-black text-white">{pick.title[0]}</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-black tracking-tight text-white group-hover:text-[#ff8c42] transition-colors">{pick.title}</h3>
            <p className="line-clamp-1 text-sm text-zinc-400">{pick.description}</p>
          </div>
          <div className="hidden shrink-0 items-center gap-4 sm:flex">
            <span className="inline-flex items-center gap-1.5 text-sm font-black text-white"><Download className="h-4 w-4 text-[#ff6a1a]" />{formatNumber(pick.downloads)}</span>
            <ArrowRight className="h-5 w-5 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
        <span className="hidden shrink-0 items-center gap-1.5 text-[11px] font-bold tracking-widest text-zinc-500 lg:inline-flex">
          <Calendar className="h-3.5 w-3.5" /> NEW PICK {nextWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
    <section className="border-b border-zinc-800 bg-[#141418] py-4">
      <div className="container flex flex-wrap items-center gap-3">
        <span className="text-xs font-black tracking-[0.18em] text-zinc-500">PLAYING A SPECIFIC VERSION?</span>
        <div className="flex flex-wrap gap-2">
          {versions.map((v: any) => (
            <button
              key={v.id ?? v.version}
              onClick={() => router.push(`/mods?gameVersions=${v.version}`)}
              className="group inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#1e1e22] px-3 py-1.5 text-xs font-black text-zinc-300 hover:border-[#ff6a1a]/50 hover:bg-[#ff6a1a]/10 hover:text-[#ff8c42] transition-colors"
            >
              {v.version}
              <ChevronDown className="h-3 w-3 opacity-40" />
            </button>
          ))}
          <Link href="/mods" className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-black tracking-widest text-[#ff6a1a] hover:bg-[#ff6a1a]/10">
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
      className="group inline-flex h-[48px] items-center gap-2.5 rounded-[10px] border border-dashed border-zinc-700 bg-zinc-900/60 px-6 text-sm font-black tracking-wide text-zinc-300 hover:border-[#ff6a1a]/60 hover:text-white hover:bg-[#ff6a1a]/5 transition-all disabled:opacity-40"
    >
      <Dice5 className={`h-5 w-5 text-[#ff6a1a] ${rolling ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
      {rolling ? 'ROLLING…' : 'SURPRISE ME'}
    </button>
  );
}

/* ────────────────────────  AUTHOR SPOTLIGHTS  ──────────────────────── */

export function AuthorSpotlights() {
  interface AuthorAgg { username: string; downloads: number; count: number; icon?: string; top?: string }
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
        const cur: AuthorAgg = map.get(name) ?? { username: name, downloads: 0, count: 0, top: p.slug };
        cur.downloads += p.downloads ?? 0;
        cur.count += 1;
        cur.icon = cur.icon ?? p.iconUrl;
        map.set(name, cur);
      }
      return Array.from(map.values()).sort((a, b) => b.downloads - a.downloads).slice(0, 4);
    },
    staleTime: 300_000,
  });

  if (authors.length === 0) return null;

  return (
    <section className="border-y border-zinc-800 bg-[#141418] py-10">
      <div className="container">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-white sm:text-2xl">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#ff6a1a] text-white"><Users className="h-4 w-4" /></span>
              TOP AUTHORS THIS WEEK
            </h2>
            <p className="mt-1 text-sm text-zinc-500">The creators behind your favorite mods — follow them for updates.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {authors.map((a, i) => (
            <Link key={a.username} href={`/user/${a.username}`} className="group relative overflow-hidden rounded-[14px] border border-zinc-800 bg-[#1a1a1e] p-5 hover:border-zinc-700 transition-colors">
              {i === 0 && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[9px] font-black tracking-widest text-amber-400">
                  <Flame className="h-3 w-3" /> #1
                </span>
              )}
              <div className="relative mb-3 h-12 w-12 overflow-hidden rounded-full bg-zinc-800 ring-2 ring-zinc-700 group-hover:ring-[#ff6a1a]/60 transition-all">
                {a.icon ? (
                  <Image src={a.icon} alt={a.username} fill sizes="48px" className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-base font-black text-white">{a.username[0]?.toUpperCase()}</div>
                )}
              </div>
              <h3 className="truncate text-sm font-black tracking-tight text-white group-hover:text-[#ff8c42]">@{a.username}</h3>
              <p className="mt-0.5 text-xs font-semibold text-zinc-500">{a.count} project{a.count > 1 ? 's' : ''}</p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-zinc-400"><Download className="h-3.5 w-3.5 text-zinc-600" />{formatNumber(a.downloads)} total</p>
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
  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_URL ?? '#';

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
    <section className="relative overflow-hidden border-y border-zinc-800 bg-[#0e0e10] py-12">
      {/* grid texture */}
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute -left-24 bottom-0 h-64 w-96 rounded-full bg-[#5865F2]/10 blur-[80px]" />
      <div className="absolute -right-24 top-0 h-64 w-96 rounded-full bg-[#ff6a1a]/10 blur-[80px]" />

      <div className="relative container grid gap-10 md:grid-cols-2">
        {/* Newsletter */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1 text-[10px] font-black tracking-widest text-zinc-400 border border-zinc-800">
            <Mail className="h-3 w-3 text-[#ff6a1a]" /> WEEKLY DIGEST
          </span>
          <h3 className="mt-4 text-xl font-black tracking-tight text-white sm:text-2xl">THE BEST MODS.<br />EVERY FRIDAY.</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">Top trending mods, hidden gems and author interviews — straight to your inbox. No spam, unsubscribe anytime.</p>
          {done ? (
            <p className="mt-5 inline-flex items-center gap-2 rounded-[10px] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-400">
              You&apos;re in! Check your inbox Friday.
            </p>
          ) : (
            <form
              className="mt-5 flex max-w-md gap-2"
              onSubmit={subscribe}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(false); }}
                placeholder="you@example.com"
                className="h-[46px] min-w-0 flex-1 rounded-[10px] border border-zinc-800 bg-zinc-900 px-4 text-sm text-white placeholder:text-zinc-600 focus:border-[#ff6a1a]/50 focus:outline-none focus:ring-4 focus:ring-[#ff6a1a]/10"
              />
              <Button type="submit" className="h-[46px] rounded-[10px] bg-white px-6 text-sm font-black tracking-wide text-zinc-900 hover:bg-zinc-200">
                SUBSCRIBE
              </Button>
            </form>
          )}
          {error && !done && (
            <p className="mt-2 text-xs text-red-400">Something went wrong — please try again.</p>
          )}
        </div>

        {/* Discord */}
        <div className="flex flex-col justify-center md:items-end">
          <div className="w-full max-w-md rounded-[16px] border border-[#5865F2]/30 bg-[#5865F2]/5 p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#5865F2] text-white shadow-[0_8px_24px_rgba(88,101,242,0.35)]">
                <MessageCircle className="h-6 w-6" />
              </span>
              <div>
                <h4 className="text-base font-black tracking-tight text-white">JOIN THE DISCORD</h4>
                <p className="text-xs font-semibold text-zinc-500">28,000+ modders &amp; players</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Get help installing mods, share your builds, and talk directly with authors. Daily mod showcases and early beta access.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild size="sm" className="rounded-full bg-[#5865F2] px-5 font-black tracking-wide text-white hover:bg-[#6873f5]">
                <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                  JOIN SERVER <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-full border-zinc-700 bg-transparent font-black tracking-wide text-zinc-300 hover:bg-zinc-900 hover:text-white">
                <a href={process.env.NEXT_PUBLIC_GITHUB_URL ?? '#'} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                  <Github className="h-3.5 w-3.5" /> STAR ON GITHUB
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

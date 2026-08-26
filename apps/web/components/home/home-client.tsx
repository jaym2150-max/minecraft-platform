'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Search,
  Download,
  Gamepad2,
  Layers,
  Box,
  Hammer,
  Compass,
  Flame,
  Trophy,
  Clock,
  Eye,
  Users,
  ArrowRight,
  ChevronRight,
  Star,
  Zap,
  Shield,
  Package,
} from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { LiveTicker } from '@/components/live-ticker';
import {
  ModOfTheWeek,
  VersionFilterBar,
  RandomModButton,
  AuthorSpotlights,
  CommunityBand,
} from '@/components/home-sections';
import { formatNumber } from '@mcp/utils/helpers';
import { HOME_KEYS, mapHomeProjects, mapHomeCollections, mapHomeStats } from '@/lib/home-data';

// Homepage — dense gaming-utilitarian layout built entirely on semantic
// theme tokens (bg-card, border-border, brand/*) so it works in light and
// dark mode with a single brand identity: Forge orange primary.

// Shared with the RSC prefetch in app/page.tsx — same keys + shapes so the
// server-dehydrated data hydrates without a client refetch.
function useTrendingProjects(limit = 8) {
  return useQuery({
    queryKey: [...HOME_KEYS.trending(limit)],
    queryFn: async () => {
      const res: any = await sdk.listProjects({ sort: 'downloads', limit });
      return mapHomeProjects(Array.isArray(res?.data) ? res.data : []);
    },
    staleTime: 60_000,
  });
}

function useUpdatedProjects(limit = 5) {
  return useQuery({
    queryKey: [...HOME_KEYS.updated(limit)],
    queryFn: async () => {
      const res: any = await sdk.listProjects({ sort: 'updated', limit });
      return mapHomeProjects(Array.isArray(res?.data) ? res.data : []);
    },
    staleTime: 60_000,
  });
}

function useFeaturedCollections(limit = 3) {
  return useQuery({
    queryKey: [...HOME_KEYS.collections(limit)],
    queryFn: async () => {
      const res: any = await sdk.listCollections({ limit });
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      return mapHomeCollections(data, limit);
    },
    staleTime: 60_000,
  });
}

function useHomeCategories() {
  return useQuery({
    queryKey: [...HOME_KEYS.categories],
    queryFn: async () => {
      const res: any = await sdk.listCategories();
      const data = Array.isArray(res?.data) ? res.data : [];
      return data.slice(0, 8);
    },
    staleTime: 300_000,
  });
}

function useInstanceStats() {
  return useQuery({
    queryKey: [...HOME_KEYS.stats],
    queryFn: async () => {
      const res: any = await sdk.getStatistics();
      const d = res?.data ?? res;
      return mapHomeStats(d);
    },
    staleTime: 60_000,
  });
}

// Category icon map — CurseForge style blocky icons
const CAT_ICONS: Record<string, React.ElementType> = {
  Adventure: Compass,
  Performance: Zap,
  Technology: Layers,
  Utility: Hammer,
  Magic: Flame,
  Library: Package,
  'World Gen': Box,
  Food: Gamepad2,
  Mobs: Users,
  Equipment: Shield,
  Decoration: Layers,
  Cursed: Trophy,
};

export default function HomeClient() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const { data: trending = [], isLoading } = useTrendingProjects(8);
  const { data: updated = [], isLoading: updatedLoading } = useUpdatedProjects(5);
  const { data: collections = [] } = useFeaturedCollections(3);
  const { data: cats = [] } = useHomeCategories();
  const { data: stats } = useInstanceStats();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const s = q.trim();
    router.push(s ? `/mods?q=${encodeURIComponent(s)}` : '/mods');
  };

  return (
    <div
      id="main-content"
      className="bg-background text-foreground selection:bg-brand/30 flex min-h-screen flex-col"
    >
      {/* CurseForge-style top bar — void black, orange accent, dense utilitarian */}
      <div className="border-border bg-background sticky top-0 z-50 border-b">
        <Navbar />
      </div>

      {/* LIVE ACTIVITY TICKER — real-time feed of updates */}
      <LiveTicker />

      {/* MOD OF THE WEEK — rotating weekly banner */}
      <ModOfTheWeek />

      {/* HERO — full-bleed Minecraft/crafting backdrop, CurseForge style */}
      <section className="border-border relative overflow-hidden border-b">
        {/* Background — subtle grid + gradient, no purple */}
        <div className="absolute inset-0">
          <div className="bg-background absolute inset-0" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--brand)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--brand)) 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          />
          <div className="to-background absolute inset-0 bg-gradient-to-b from-transparent via-transparent" />
          {/* Amber glow */}
          <div className="bg-brand/10 absolute -top-32 left-1/2 h-[520px] w-[880px] -translate-x-1/2 rounded-full blur-[90px]" />
          <div className="bg-brand-light/10 absolute right-[10%] top-0 h-[260px] w-[420px] rounded-full blur-[70px]" />
        </div>

        <div className="container relative py-10 md:py-14">
          {/* Breadcrumb */}
          <div className="text-muted-foreground mb-6 flex items-center gap-2 text-xs font-semibold tracking-widest">
            <span className="bg-brand h-2 w-2 rounded-full shadow-[0_0_8px_hsl(21_90%_55%/0.6)]" />
            MINECRAFT • MODS • CURATED
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            {/* Left — headline + search */}
            <div>
              <h1 className="text-[2.6rem] font-black leading-[0.9] tracking-[-0.04em] sm:text-[3.4rem] lg:text-[4rem]">
                <span className="text-foreground block">FIND YOUR</span>
                <span className="text-brand-deep block">NEXT MOD</span>
              </h1>
              <p className="text-muted-foreground mt-4 max-w-xl text-sm leading-6 lg:text-[15px]">
                The home for Minecraft mods, modpacks and plugins. One search, every loader, every
                version — built for players who craft their own game.
              </p>

              {/* Search — CurseForge style: thick border, orange CTA */}
              <form onSubmit={onSearch} className="mt-7 flex max-w-[560px] gap-2">
                <div className="relative flex-1">
                  <Search className="text-muted-foreground pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search mods, modpacks, plugins..."
                    className="border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-brand focus:ring-brand/20 h-[48px] w-full rounded-[10px] border pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-4"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-brand-hover h-[48px] rounded-[10px] px-7 text-sm font-black tracking-wide transition-all hover:shadow-[0_8px_24px_hsl(21_90%_55%/0.3)]"
                >
                  SEARCH
                </Button>
              </form>

              {/* Quick filters */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-foreground font-bold tracking-widest">POPULAR:</span>
                {['Sodium', 'Create', 'JEI', 'Iris'].map((s) => (
                  <button
                    key={s}
                    onClick={() => router.push(`/mods?q=${s}`)}
                    className="border-border bg-card text-foreground/80 hover:border-brand/40 hover:text-foreground hover:bg-accent rounded-full border px-3 py-1 font-semibold transition-colors"
                  >
                    {s}
                  </button>
                ))}
                <RandomModButton />
              </div>
            </div>

            {/* Right — featured spotlight card */}
            <div className="relative lg:pl-6">
              <div className="border-border bg-card/60 rounded-[16px] border p-3 backdrop-blur">
                <div className="flex items-center justify-between px-1 pb-3">
                  <span className="text-muted-foreground text-xs font-black tracking-[0.14em]">
                    FEATURED
                  </span>
                  <span className="bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black tracking-wide">
                    EDITOR&apos;S PICK
                  </span>
                </div>
                {trending[0] ? (
                  <Link
                    href={`/mod/${trending[0].slug}`}
                    className="bg-muted/40 border-border hover:border-brand/40 group relative flex gap-4 rounded-[12px] border p-4 transition-colors"
                  >
                    <div className="bg-muted relative h-20 w-20 shrink-0 overflow-hidden rounded-[10px]">
                      {trending[0].iconUrl ? (
                        <Image
                          src={trending[0].iconUrl}
                          alt={trending[0].title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="text-foreground flex h-full w-full items-center justify-center text-xl font-black">
                          {trending[0].title[0]}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-foreground group-hover:text-brand-deep truncate text-base font-black tracking-tight transition-colors">
                        {trending[0].title}
                      </h3>
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-5">
                        {trending[0].description}
                      </p>
                      <div className="text-muted-foreground mt-2 flex items-center gap-3 text-xs font-bold">
                        <span className="inline-flex items-center gap-1">
                          <Download className="h-3.5 w-3.5" />
                          {formatNumber(trending[0].downloads)}
                        </span>
                        <span className="bg-muted-foreground/50 h-1 w-1 rounded-full" />
                        <span className="text-foreground/80">{trending[0].author?.username}</span>
                      </div>
                    </div>
                    <ChevronRight className="text-muted-foreground group-hover:text-foreground h-5 w-5 shrink-0 self-center transition-all group-hover:translate-x-0.5" />
                  </Link>
                ) : (
                  <div className="bg-muted/40 border-border text-muted-foreground rounded-[12px] border p-6 text-sm">
                    Loading spotlight…
                  </div>
                )}

                {/* Stats strip inside hero — CurseForge parity but dense */}
                <div className="divide-border border-border bg-background mt-3 grid grid-cols-3 divide-x rounded-[12px] border text-center">
                  {[
                    { k: 'Projects', v: stats ? formatNumber(stats.projects) : '—' },
                    { k: 'Downloads', v: stats ? formatNumber(stats.downloads) : '—' },
                    { k: 'Authors', v: stats ? formatNumber(stats.users) : '—' },
                  ].map((s) => (
                    <div key={s.k} className="px-3 py-3">
                      <div className="text-foreground text-sm font-black tracking-tight">{s.v}</div>
                      <div className="text-muted-foreground text-[10px] font-bold tracking-[0.14em]">
                        {s.k.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MC VERSION QUICK FILTER — capture version-specific search intent */}
      <VersionFilterBar />

      {/* CATEGORY RAIL — CurseForge blocky pills, dark stone */}
      <section className="border-border bg-muted/40 border-b">
        <div className="container flex flex-wrap items-center gap-2 py-4">
          <Link
            href="/mods"
            className="bg-primary text-primary-foreground hover:bg-brand-hover inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black tracking-wide transition-colors"
          >
            BROWSE ALL
          </Link>
          <div className="bg-muted mx-1 h-6 w-px" />
          {cats.map((c: any) => {
            const Icon = CAT_ICONS[c.name] ?? Box;
            return (
              <Link
                key={c.id}
                href={`/mods?categories=${c.id}`}
                className="border-border bg-card text-foreground/80 hover:border-brand/40 hover:bg-accent hover:text-foreground inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-bold transition-colors"
              >
                <Icon className="text-muted-foreground h-4 w-4" /> {c.name}
              </Link>
            );
          })}
          <Link
            href="/mods"
            className="text-muted-foreground hover:text-foreground ml-auto hidden items-center gap-1 text-xs font-black tracking-widest md:inline-flex"
          >
            VIEW ALL <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* TRENDING — dark cards, image header, CurseForge density */}
      <section className="bg-background py-10">
        <div className="container">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-foreground flex items-center gap-3 text-xl font-black tracking-tight sm:text-2xl">
                <span className="bg-primary text-primary-foreground inline-flex h-7 w-7 items-center justify-center rounded-full">
                  <Flame className="h-4 w-4" />
                </span>
                TRENDING MODS
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Most downloaded this week — updated every hour
              </p>
            </div>
            <Link
              href="/mods?sort=downloads"
              className="text-muted-foreground hover:text-foreground hidden items-center gap-1 text-xs font-black tracking-widest sm:inline-flex"
            >
              VIEW ALL <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="border-border bg-muted h-[220px] animate-pulse rounded-[14px] border"
                />
              ))}
            </div>
          ) : trending.length === 0 ? (
            <div className="border-border bg-card text-muted-foreground rounded-[14px] border border-dashed p-12 text-center text-sm">
              No trending projects yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {trending.slice(0, 8).map((m) => (
                <Link
                  key={m.id}
                  href={`/mod/${m.slug}`}
                  className="border-border bg-card hover:border-brand/40 hover:bg-accent/50 group relative flex flex-col overflow-hidden rounded-[14px] border transition-colors"
                >
                  {/* Top accent */}
                  <div className="from-brand via-brand-light h-1 w-full bg-gradient-to-r to-transparent opacity-90" />
                  <div className="flex gap-3 p-4">
                    <div className="bg-muted ring-border relative h-14 w-14 shrink-0 overflow-hidden rounded-[10px] ring-1">
                      {m.iconUrl ? (
                        <Image
                          src={m.iconUrl}
                          alt={m.title}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="bg-muted text-foreground flex h-full w-full items-center justify-center text-sm font-black">
                          {m.title[0]}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-foreground group-hover:text-brand-deep truncate text-sm font-black tracking-tight transition-colors">
                        {m.title}
                      </h3>
                      <p className="text-muted-foreground truncate text-xs font-semibold">
                        by {m.author?.username}
                      </p>
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-5">
                        {m.description}
                      </p>
                    </div>
                  </div>
                  <div className="border-border bg-muted/40 mt-auto flex items-center justify-between border-t px-4 py-3 text-xs">
                    <span className="text-foreground/80 inline-flex items-center gap-1.5 font-bold">
                      <Download className="text-muted-foreground h-3.5 w-3.5" />
                      {formatNumber(m.downloads)}
                    </span>
                    <span className="text-muted-foreground inline-flex items-center gap-1 font-bold tracking-widest">
                      <Eye className="h-3.5 w-3.5" />
                      {formatNumber((m as any).views ?? 0)}
                    </span>
                    <span className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-[10px] font-black tracking-widest">
                      {m.categoryName ?? 'MOD'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-center sm:hidden">
            <Link
              href="/mods"
              className="text-muted-foreground inline-flex items-center gap-1 text-xs font-black tracking-widest"
            >
              VIEW ALL <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED COLLECTIONS — CurseForge curated shelf, dark stone */}
      <section className="border-border bg-muted/40 border-y py-10">
        <div className="container">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-foreground flex items-center gap-3 text-xl font-black tracking-tight sm:text-2xl">
              <span className="bg-primary text-primary-foreground inline-flex h-7 w-7 items-center justify-center rounded-full">
                <Layers className="h-4 w-4" />
              </span>
              FEATURED COLLECTIONS
            </h2>
            <Link
              href="/collections"
              className="text-muted-foreground hover:text-foreground hidden items-center gap-1 text-xs font-black tracking-widest sm:inline-flex"
            >
              VIEW ALL <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {collections.length === 0 ? (
            <div className="border-border bg-card rounded-[14px] border border-dashed p-10 text-center">
              <p className="text-foreground/80 text-sm font-bold tracking-wide">
                No collections yet
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Be the first to curate a list — then it shows here.
              </p>
              <Button
                asChild
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 rounded-full font-black tracking-wide"
              >
                <Link href="/collections">EXPLORE COLLECTIONS</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {collections.map((c: any) => (
                <Link
                  key={c.id}
                  href={`/collections/${c.id}`}
                  className="border-border bg-card hover:border-brand/40 group overflow-hidden rounded-[14px] border transition-colors"
                >
                  {/* Cover image */}
                  <div className="bg-muted relative h-36 w-full overflow-hidden">
                    {c.iconUrl ? (
                      <Image
                        src={(c as any).iconUrl}
                        alt={c.name}
                        fill
                        sizes="(min-width:768px) 400px, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : null}
                    <div className="from-background/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
                    <span className="text-foreground absolute bottom-2 left-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-black tracking-widest backdrop-blur">
                      <Box className="text-brand-light h-3 w-3" /> {c.projectCount ?? 0} PROJECTS
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-foreground group-hover:text-brand-deep line-clamp-1 text-sm font-black tracking-tight">
                      {c.name}
                    </h3>
                    <p className="text-muted-foreground mt-1 line-clamp-2 min-h-[2.5rem] text-xs leading-5">
                      {c.description || 'A curated collection of mods'}
                    </p>
                    <div className="border-border text-muted-foreground mt-4 flex items-center justify-between border-t pt-3 text-xs font-bold tracking-widest">
                      <span className="inline-flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" />
                        CURATED
                      </span>
                      <span className="text-foreground/80">@{c.user?.username ?? 'community'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* LOADER SPLIT — CurseForge "works with everything" band */}
      <section className="border-border bg-background border-b py-10">
        <div className="container">
          <p className="text-muted-foreground text-center text-xs font-black tracking-[0.2em]">
            WORKS WITH EVERY LOADER
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {[
              { n: 'Fabric', d: 'Lightweight & modern', c: '#d7a86e' },
              { n: 'Forge', d: 'The classic standard', c: '#f16436' },
              { n: 'NeoForge', d: 'Forge, evolved', c: '#f6a83c' },
              { n: 'Quilt', d: 'Community driven', c: '#8ca9cc' },
              { n: 'Bukkit', d: 'Server plugins', c: '#a05ec9' },
            ].map((l) => (
              <Link
                key={l.n}
                href={`/mods?loaders=${l.n.toUpperCase()}`}
                className="border-border bg-muted/40 hover:border-brand/40 hover:bg-card group flex items-center gap-3 rounded-[12px] border px-4 py-3.5 transition-colors"
              >
                <span
                  className="h-8 w-8 shrink-0 rounded-lg border border-white/10 shadow-inner"
                  style={{ background: `linear-gradient(135deg, ${l.c}, ${l.c}44)` }}
                />
                <span className="min-w-0">
                  <span className="text-foreground group-hover:text-brand-deep block truncate text-sm font-black tracking-tight transition-colors">
                    {l.n}
                  </span>
                  <span className="text-muted-foreground block truncate text-[11px] font-semibold">
                    {l.d}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* EDITOR'S CHOICE + NEWLY UPDATED — two-column CurseForge shelf */}
      <section className="bg-background py-10">
        <div className="container grid gap-8 lg:grid-cols-2">
          {[
            {
              title: 'EDITOR’S CHOICE',
              icon: Trophy,
              tint: 'text-amber-400',
              sort: 'downloads',
              blurb: 'Hand-picked by our curation team — the best of the best.',
            },
            {
              title: 'RECENTLY UPDATED',
              icon: Clock,
              tint: 'text-emerald-400',
              sort: 'updated',
              blurb: 'Fresh builds, hot off the press from active authors.',
            },
          ].map((shelf) => {
            const Icon = shelf.icon;
            // Distinct data per shelf — previously both showed the same
            // `trending` list (dead ternary bug).
            const items = (shelf.sort === 'downloads' ? trending : updated).slice(0, 5);
            const shelfLoading = shelf.sort === 'downloads' ? isLoading : updatedLoading;
            return (
              <div key={shelf.title}>
                <div className="mb-4 flex items-end justify-between">
                  <h2 className="text-foreground flex items-center gap-3 text-base font-black tracking-tight sm:text-lg">
                    <Icon className={`h-5 w-5 ${shelf.tint}`} />
                    {shelf.title}
                  </h2>
                  <Link
                    href={`/mods?sort=${shelf.sort}`}
                    className="text-muted-foreground hover:text-foreground text-xs font-black tracking-widest"
                  >
                    MORE <ChevronRight className="ml-0.5 inline h-3.5 w-3.5" />
                  </Link>
                </div>
                <p className="text-muted-foreground -mt-2 mb-4 text-sm">{shelf.blurb}</p>
                <div className="space-y-2">
                  {shelfLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="border-border bg-muted h-[64px] animate-pulse rounded-[12px] border"
                      />
                    ))
                  ) : items.length === 0 ? (
                    <div className="border-border bg-card text-muted-foreground rounded-[12px] border border-dashed p-6 text-center text-xs">
                      Nothing here yet.
                    </div>
                  ) : (
                    items.map((m, i) => (
                      <Link
                        key={m.id}
                        href={`/mod/${m.slug}`}
                        className="border-border bg-muted/40 hover:border-brand/40 hover:bg-card group flex items-center gap-3 rounded-[12px] border p-3 transition-colors"
                      >
                        <span className="text-muted-foreground w-6 text-center text-sm font-black">
                          {i + 1}
                        </span>
                        <div className="bg-muted ring-border relative h-10 w-10 shrink-0 overflow-hidden rounded-[8px] ring-1">
                          {m.iconUrl ? (
                            <Image
                              src={m.iconUrl}
                              alt={m.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="text-foreground flex h-full w-full items-center justify-center text-xs font-black">
                              {m.title[0]}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-foreground group-hover:text-brand-deep truncate text-sm font-bold transition-colors">
                            {m.title}
                          </h3>
                          <p className="text-muted-foreground truncate text-xs">
                            {m.categoryName ?? 'MOD'} • by {m.author?.username}
                          </p>
                        </div>
                        <span className="text-muted-foreground inline-flex shrink-0 items-center gap-1 text-xs font-bold">
                          <Download className="text-muted-foreground h-3.5 w-3.5" />
                          {formatNumber(m.downloads)}
                        </span>
                        {i === 0 && (
                          <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                        )}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PLATFORM PILLARS — why us, dark utilitarian */}
      <section className="border-border bg-muted/40 border-y py-12">
        <div className="container">
          <h2 className="text-foreground text-center text-xl font-black tracking-tight sm:text-2xl">
            BUILT FOR MODDERS
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-xl text-center text-sm">
            Every file scanned, every author verified, every version tracked.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Shield,
                t: 'Malware Scanned',
                d: 'ClamAV scans every upload before it goes live. No exceptions.',
              },
              {
                icon: Zap,
                t: 'One-Click Installs',
                d: 'Dependency resolution handles the modpack spaghetti for you.',
              },
              {
                icon: Users,
                t: 'Creator Payouts',
                d: 'Authors earn from day one with points on every download.',
              },
              {
                icon: Package,
                t: 'All Loaders',
                d: 'Fabric, Forge, NeoForge, Quilt and Bukkit in a single catalog.',
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.t}
                  className="border-border bg-card hover:border-brand/40 group rounded-[14px] border p-5 transition-colors"
                >
                  <div className="border-brand/30 bg-brand/10 text-brand-deep mb-4 inline-flex h-10 w-10 items-center justify-center rounded-[10px] border">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-foreground text-sm font-black tracking-tight">{f.t}</h3>
                  <p className="text-muted-foreground mt-1.5 text-xs leading-5">{f.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AUTHOR SPOTLIGHTS — community glue */}
      <AuthorSpotlights />

      {/* NEWSLETTER + DISCORD — retention band */}
      <CommunityBand />

      {/* BOTTOM CTA — CurseForge style, not generic SaaS */}
      <section className="border-border bg-background relative overflow-hidden border-t py-12">
        <div className="from-brand/10 absolute inset-0 bg-gradient-to-r via-transparent to-transparent" />
        <div className="container relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h3 className="text-foreground text-lg font-black tracking-tight sm:text-xl">
              READY TO SHIP YOUR MOD?
            </h3>
            <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-6">
              Upload once, publish everywhere — Fabric, Forge, Quilt and NeoForge in one place.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-brand-hover rounded-full px-7 font-black tracking-wide"
            >
              <Link href="/dashboard/uploads">UPLOAD MOD</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-border text-foreground hover:bg-card hover:text-foreground rounded-full bg-transparent font-black tracking-wide"
            >
              <Link href="/docs">READ DOCS</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

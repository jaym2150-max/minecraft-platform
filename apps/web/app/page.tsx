'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Search, Download, Gamepad2, Layers, Box, Hammer, Compass, Flame, Trophy, Clock, Eye, Users,
  ArrowRight, ChevronRight, Star, Zap, Shield, Package
} from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { LiveTicker } from '@/components/live-ticker';
import { ModOfTheWeek, VersionFilterBar, RandomModButton, AuthorSpotlights, CommunityBand } from '@/components/home-sections';
import { formatNumber } from '@mcp/utils/helpers';
import type { Project } from '@mcp/types';

// CurseForge palette — deep void black, Forge orange, stone grays
// No purple gradients. No Inter. Intentionally brutal gaming utilitarian.

function useTrendingProjects(limit = 8) {
  return useQuery({
    queryKey: ['home', 'trending', limit],
    queryFn: async () => {
      const res: any = await sdk.listProjects({ sort: 'downloads', limit });
      const data: Project[] = Array.isArray(res?.data) ? res.data : [];
      return data.map((p: any) => ({
        id: p.id, title: p.title, slug: p.slug, description: p.description,
        downloads: p.downloads ?? 0, views: p.views ?? 0,
        author: p.author ?? { username: 'Unknown' }, iconUrl: p.iconUrl,
        categoryName: p.category?.name ?? p.categoryName,
      }));
    },
    staleTime: 60_000,
  });
}

function useFeaturedCollections(limit = 3) {
  return useQuery({
    queryKey: ['home', 'collections', limit],
    queryFn: async () => {
      const res: any = await sdk.listCollections({ limit });
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      return data.slice(0, limit).map((c: any) => ({
        id: c.id, name: c.name, description: c.description,
        isPublic: c.isPublic ?? true, projectCount: c.projectCount ?? c.projects?.length ?? 0,
        user: c.user,
      }));
    },
    staleTime: 60_000,
  });
}

function useHomeCategories() {
  return useQuery({
    queryKey: ['home', 'categories'],
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
    queryKey: ['home', 'stats'],
    queryFn: async () => {
      const res: any = await sdk.getStatistics();
      const d = res?.data ?? res;
      return { projects: d.projects ?? 0, downloads: d.downloads ?? 0, users: d.users ?? 0 };
    },
    staleTime: 60_000,
  });
}

// Category icon map — CurseForge style blocky icons
const CAT_ICONS: Record<string, React.ElementType> = {
  Adventure: Compass, Performance: Zap, Technology: Layers, Utility: Hammer,
  Magic: Flame, Library: Package, 'World Gen': Box, Food: Gamepad2, Mobs: Users, Equipment: Shield,
  Decoration: Layers, Cursed: Trophy,
};

export default function HomePage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const { data: trending = [], isLoading } = useTrendingProjects(8);
  const { data: collections = [] } = useFeaturedCollections(3);
  const { data: cats = [] } = useHomeCategories();
  const { data: stats } = useInstanceStats();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const s = q.trim();
    router.push(s ? `/mods?q=${encodeURIComponent(s)}` : '/mods');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-[#ff6a1a]/30">
      {/* CurseForge-style top bar — void black, orange accent, dense utilitarian */}
      <div className="sticky top-0 z-50 border-b border-border bg-background">
        <Navbar />
      </div>

      {/* LIVE ACTIVITY TICKER — real-time feed of updates */}
      <LiveTicker />

      {/* MOD OF THE WEEK — rotating weekly banner */}
      <ModOfTheWeek />

      {/* HERO — full-bleed Minecraft/crafting backdrop, CurseForge style */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Background — subtle grid + gradient, no purple */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(#ff6a1a 1px, transparent 1px), linear-gradient(90deg, #ff6a1a 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          {/* Amber glow */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[520px] w-[880px] rounded-full bg-[#ff6a1a]/10 blur-[90px]" />
          <div className="absolute top-0 right-[10%] h-[260px] w-[420px] rounded-full bg-[#ff8c42]/07 blur-[70px]" />
        </div>

        <div className="relative container py-10 md:py-14">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-[#ff6a1a] shadow-[0_0_8px_rgba(255,106,26,0.6)]" />
            MINECRAFT • MODS • CURATED
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-start">
            {/* Left — headline + search */}
            <div>
              <h1 className="font-black tracking-[-0.04em] leading-[0.9] text-[2.6rem] sm:text-[3.4rem] lg:text-[4rem]">
                <span className="block text-foreground">FIND YOUR</span>
                <span className="block text-[#ff6a1a]">NEXT MOD</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground lg:text-[15px]">
                The home for Minecraft mods, modpacks and plugins. One search, every loader, every version — built for players who craft their own game.
              </p>

              {/* Search — CurseForge style: thick border, orange CTA */}
              <form onSubmit={onSearch} className="mt-7 flex max-w-[560px] gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search mods, modpacks, plugins..."
                    className="h-[48px] w-full rounded-[10px] border border-border bg-card pl-11 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-[#ff6a1a]/50 focus:outline-none focus:ring-4 focus:ring-[#ff6a1a]/10"
                  />
                </div>
                <Button type="submit" className="h-[48px] rounded-[10px] bg-[#ff6a1a] px-7 text-sm font-black tracking-wide text-foreground hover:bg-[#ff7a33] hover:shadow-[0_8px_24px_rgba(255,106,26,0.3)] transition-all">
                  SEARCH
                </Button>
              </form>

              {/* Quick filters */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold tracking-widest text-muted-foreground">POPULAR:</span>
                {['Sodium','Create','JEI','Iris'].map(s => (
                  <button key={s} onClick={() => router.push(`/mods?q=${s}`)} className="rounded-full border border-border bg-card px-3 py-1 font-semibold text-foreground/80 hover:border-border hover:text-foreground hover:bg-accent transition-colors">{s}</button>
                ))}
                <RandomModButton />
              </div>
            </div>

            {/* Right — featured spotlight card */}
            <div className="relative lg:pl-6">
              <div className="rounded-[16px] border border-border bg-card/60 p-3 backdrop-blur">
                <div className="flex items-center justify-between px-1 pb-3">
                  <span className="text-xs font-black tracking-[0.14em] text-muted-foreground">FEATURED</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ff6a1a] px-2.5 py-1 text-xs font-black tracking-wide text-foreground">EDITOR&apos;S PICK</span>
                </div>
                {trending[0] ? (
                  <Link href={`/mod/${trending[0].slug}`} className="group relative flex gap-4 rounded-[12px] bg-muted/40 p-4 border border-border hover:border-border transition-colors">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[10px] bg-muted">
                      {trending[0].iconUrl ? (
                        <Image src={trending[0].iconUrl} alt={trending[0].title} fill sizes="80px" className="object-cover" unoptimized />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-black text-foreground">{trending[0].title[0]}</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-black tracking-tight text-foreground group-hover:text-[#ff6a1a] transition-colors">{trending[0].title}</h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{trending[0].description}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs font-bold text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Download className="h-3.5 w-3.5" />{formatNumber(trending[0].downloads)}</span>
                        <span className="h-1 w-1 rounded-full bg-zinc-700" />
                        <span className="text-foreground/80">{trending[0].author?.username}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 self-center text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ) : (
                  <div className="rounded-[12px] bg-muted/40 p-6 border border-border text-sm text-muted-foreground">Loading spotlight…</div>
                )}

                {/* Stats strip inside hero — CurseForge parity but dense */}
                <div className="mt-3 grid grid-cols-3 divide-x divide-border rounded-[12px] border border-border bg-background text-center">
                  {[
                    { k: 'Projects', v: stats ? formatNumber(stats.projects) : '—' },
                    { k: 'Downloads', v: stats ? formatNumber(stats.downloads) : '—' },
                    { k: 'Authors', v: stats ? formatNumber(stats.users) : '—' },
                  ].map(s => (
                    <div key={s.k} className="px-3 py-3">
                      <div className="text-sm font-black tracking-tight text-foreground">{s.v}</div>
                      <div className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground">{s.k.toUpperCase()}</div>
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
      <section className="border-b border-border bg-muted/40">
        <div className="container flex flex-wrap items-center gap-2 py-4">
          <Link href="/mods" className="inline-flex items-center gap-2 rounded-full bg-[#ff6a1a] px-4 py-2 text-sm font-black tracking-wide text-foreground hover:bg-[#ff7a33] transition-colors">BROWSE ALL</Link>
          <div className="h-6 w-px bg-muted mx-1" />
          {cats.map((c: any) => {
            const Icon = CAT_ICONS[c.name] ?? Box;
            return (
              <Link key={c.id} href={`/mods?categories=${c.id}`} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-bold text-foreground/80 hover:border-border hover:bg-accent hover:text-foreground transition-colors">
                <Icon className="h-4 w-4 text-muted-foreground" /> {c.name}
              </Link>
            );
          })}
          <Link href="/mods" className="ml-auto hidden items-center gap-1 text-xs font-black tracking-widest text-muted-foreground hover:text-foreground md:inline-flex">VIEW ALL <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
      </section>

      {/* TRENDING — dark cards, image header, CurseForge density */}
      <section className="bg-background py-10">
        <div className="container">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-foreground sm:text-2xl">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#ff6a1a] text-foreground"><Flame className="h-4 w-4" /></span>
                TRENDING MODS
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Most downloaded this week — updated every hour</p>
            </div>
            <Link href="/mods?sort=downloads" className="hidden items-center gap-1 text-xs font-black tracking-widest text-muted-foreground hover:text-foreground sm:inline-flex">VIEW ALL <ChevronRight className="h-4 w-4" /></Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[220px] animate-pulse rounded-[14px] border border-border bg-muted" />
              ))}
            </div>
          ) : trending.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">No trending projects yet.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {trending.slice(0, 8).map((m) => (
                <Link key={m.id} href={`/mod/${m.slug}`} className="group relative flex flex-col overflow-hidden rounded-[14px] border border-border bg-card hover:border-border hover:bg-accent/50 transition-colors">
                  {/* Top accent */}
                  <div className="h-1 w-full bg-gradient-to-r from-[#ff6a1a] via-[#ff8c42] to-transparent opacity-90" />
                  <div className="flex gap-3 p-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[10px] bg-muted ring-1 ring-border">
                      {m.iconUrl ? (
                        <Image src={m.iconUrl} alt={m.title} fill sizes="56px" className="object-cover" unoptimized />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted text-sm font-black text-foreground">{m.title[0]}</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-black tracking-tight text-foreground group-hover:text-[#ff8c42] transition-colors">{m.title}</h3>
                      <p className="truncate text-xs font-semibold text-muted-foreground">by {m.author?.username}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{m.description}</p>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-border bg-muted/40 px-4 py-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-bold text-foreground/80"><Download className="h-3.5 w-3.5 text-muted-foreground" />{formatNumber(m.downloads)}</span>
                    <span className="inline-flex items-center gap-1 font-bold tracking-widest text-muted-foreground"><Eye className="h-3.5 w-3.5" />{formatNumber((m as any).views ?? 0)}</span>
                    <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-black tracking-widest text-muted-foreground">{m.categoryName ?? 'MOD'}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-center sm:hidden">
            <Link href="/mods" className="inline-flex items-center gap-1 text-xs font-black tracking-widest text-muted-foreground">VIEW ALL <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        </div>
      </section>

      {/* FEATURED COLLECTIONS — CurseForge curated shelf, dark stone */}
      <section className="border-y border-border bg-muted/40 py-10">
        <div className="container">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-foreground sm:text-2xl">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground"><Layers className="h-4 w-4" /></span>
              FEATURED COLLECTIONS
            </h2>
            <Link href="/collections" className="hidden items-center gap-1 text-xs font-black tracking-widest text-muted-foreground hover:text-foreground sm:inline-flex">VIEW ALL <ChevronRight className="h-4 w-4" /></Link>
          </div>

          {collections.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-border bg-card p-10 text-center">
              <p className="text-sm font-bold tracking-wide text-foreground/80">No collections yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Be the first to curate a list — then it shows here.</p>
              <Button asChild size="sm" className="mt-4 rounded-full bg-primary font-black tracking-wide text-primary-foreground hover:bg-primary/90">
                <Link href="/collections">EXPLORE COLLECTIONS</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {collections.map((c: any) => (
                <Link key={c.id} href={`/collections/${c.id}`} className="group overflow-hidden rounded-[14px] border border-border bg-card hover:border-border transition-colors">
                  {/* Cover image */}
                  <div className="relative h-36 w-full overflow-hidden bg-muted">
                    {c.iconUrl ? (
                      <Image src={(c as any).iconUrl} alt={c.name} fill sizes="(min-width:768px) 400px, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-black tracking-widest text-foreground backdrop-blur">
                      <Box className="h-3 w-3 text-[#ff8c42]" /> {c.projectCount ?? 0} PROJECTS
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="line-clamp-1 text-sm font-black tracking-tight text-foreground group-hover:text-[#ff8c42]">{c.name}</h3>
                    <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs leading-5 text-muted-foreground">{c.description || 'A curated collection of mods'}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs font-bold tracking-widest text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Layers className="h-3.5 w-3.5" />CURATED</span>
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
      <section className="border-b border-border bg-background py-10">
        <div className="container">
          <p className="text-center text-xs font-black tracking-[0.2em] text-muted-foreground">WORKS WITH EVERY LOADER</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {[
              { n: 'Fabric', d: 'Lightweight & modern', c: '#d7a86e' },
              { n: 'Forge', d: 'The classic standard', c: '#f16436' },
              { n: 'NeoForge', d: 'Forge, evolved', c: '#f6a83c' },
              { n: 'Quilt', d: 'Community driven', c: '#8ca9cc' },
              { n: 'Bukkit', d: 'Server plugins', c: '#a05ec9' },
            ].map((l) => (
              <Link key={l.n} href={`/mods?loaders=${l.n.toUpperCase()}`} className="group flex items-center gap-3 rounded-[12px] border border-border bg-muted/40 px-4 py-3.5 hover:border-border hover:bg-card transition-colors">
                <span className="h-8 w-8 shrink-0 rounded-lg border border-white/10 shadow-inner" style={{ background: `linear-gradient(135deg, ${l.c}, ${l.c}44)` }} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black tracking-tight text-foreground group-hover:text-[#ff8c42] transition-colors">{l.n}</span>
                  <span className="block truncate text-[11px] font-semibold text-muted-foreground">{l.d}</span>
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
            { title: 'EDITOR’S CHOICE', icon: Trophy, tint: 'text-amber-400', sort: 'downloads', blurb: 'Hand-picked by our curation team — the best of the best.' },
            { title: 'RECENTLY UPDATED', icon: Clock, tint: 'text-emerald-400', sort: 'updated', blurb: 'Fresh builds, hot off the press from active authors.' },
          ].map((shelf) => {
            const Icon = shelf.icon;
            const items = (shelf.sort === 'downloads' ? trending : trending).slice(0, 5);
            return (
              <div key={shelf.title}>
                <div className="mb-4 flex items-end justify-between">
                  <h2 className="flex items-center gap-3 text-base font-black tracking-tight text-foreground sm:text-lg">
                    <Icon className={`h-5 w-5 ${shelf.tint}`} />
                    {shelf.title}
                  </h2>
                  <Link href={`/mods?sort=${shelf.sort}`} className="text-xs font-black tracking-widest text-muted-foreground hover:text-foreground">MORE <ChevronRight className="ml-0.5 inline h-3.5 w-3.5" /></Link>
                </div>
                <p className="mb-4 -mt-2 text-sm text-muted-foreground">{shelf.blurb}</p>
                <div className="space-y-2">
                  {items.map((m, i) => (
                    <Link key={m.id} href={`/mod/${m.slug}`} className="group flex items-center gap-3 rounded-[12px] border border-border bg-muted/40 p-3 hover:border-border hover:bg-card transition-colors">
                      <span className="w-6 text-center text-sm font-black text-muted-foreground">{i + 1}</span>
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[8px] bg-muted ring-1 ring-border">
                        {m.iconUrl ? (
                          <Image src={m.iconUrl} alt={m.title} fill sizes="40px" className="object-cover" unoptimized />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-black text-foreground">{m.title[0]}</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold text-foreground group-hover:text-[#ff8c42] transition-colors">{m.title}</h3>
                        <p className="truncate text-xs text-muted-foreground">{m.categoryName ?? 'MOD'} • by {m.author?.username}</p>
                      </div>
                      <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-muted-foreground"><Download className="h-3.5 w-3.5 text-muted-foreground" />{formatNumber(m.downloads)}</span>
                      {i === 0 && <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PLATFORM PILLARS — why us, dark utilitarian */}
      <section className="border-y border-border bg-muted/40 py-12">
        <div className="container">
          <h2 className="text-center text-xl font-black tracking-tight text-foreground sm:text-2xl">BUILT FOR MODDERS</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground">Every file scanned, every author verified, every version tracked.</p>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, t: 'Malware Scanned', d: 'ClamAV scans every upload before it goes live. No exceptions.' },
              { icon: Zap, t: 'One-Click Installs', d: 'Dependency resolution handles the modpack spaghetti for you.' },
              { icon: Users, t: 'Creator Payouts', d: 'Authors earn from day one with points on every download.' },
              { icon: Package, t: 'All Loaders', d: 'Fabric, Forge, NeoForge, Quilt and Bukkit in a single catalog.' },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.t} className="group rounded-[14px] border border-border bg-card p-5 hover:border-border transition-colors">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#ff6a1a]/30 bg-[#ff6a1a]/10 text-[#ff8c42]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-black tracking-tight text-foreground">{f.t}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{f.d}</p>
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
      <section className="relative overflow-hidden border-t border-border bg-background py-12">
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff6a1a]/10 via-transparent to-transparent" />
        <div className="relative container flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h3 className="text-lg font-black tracking-tight text-foreground sm:text-xl">READY TO SHIP YOUR MOD?</h3>
            <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">Upload once, publish everywhere — Fabric, Forge, Quilt and NeoForge in one place.</p>
          </div>
          <div className="flex gap-3">
            <Button asChild size="lg" className="rounded-full bg-[#ff6a1a] px-7 font-black tracking-wide text-foreground hover:bg-[#ff7a33]">
              <Link href="/dashboard/uploads">UPLOAD MOD</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full border-border bg-transparent font-black tracking-wide text-foreground hover:bg-card hover:text-foreground">
              <Link href="/docs">READ DOCS</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

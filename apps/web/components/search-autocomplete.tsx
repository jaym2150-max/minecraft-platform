'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Search, Loader2, TrendingUp, CornerDownLeft } from 'lucide-react';
import { sdk } from '@/services/api';
import { formatNumber } from '@mcp/utils/helpers';

interface Suggestion {
  id: string;
  slug: string;
  title: string;
  description: string;
  iconUrl?: string;
  downloads: number;
  projectType?: string;
  author?: { username: string };
}

/**
 * CurseForge-style search autocomplete — debounced live suggestions in a
 * dropdown as the user types, with keyboard navigation (↑/↓/Enter/Esc).
 */
export function SearchAutocomplete({ className = '', placeholder = 'Search mods, modpacks, plugins...' }: {
  className?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const debounced = useDebounced(q, 200);
  const boxRef = useRef<HTMLDivElement>(null);

  const { data: suggestions = [], isFetching } = useQuery<Suggestion[]>({
    queryKey: ['search-suggest', debounced],
    queryFn: async () => {
      if (debounced.trim().length < 2) return [];
      const res: any = await sdk.listProjects({ search: debounced.trim(), limit: 6 });
      const data = Array.isArray(res?.data) ? res.data : [];
      return data.map((p: any) => ({
        id: p.id, slug: p.slug, title: p.title, description: p.description,
        iconUrl: p.iconUrl, downloads: p.downloads ?? 0,
        projectType: p.projectType, author: p.author,
      }));
    },
    enabled: debounced.trim().length >= 2,
    staleTime: 30_000,
  });

  // close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // reset highlight when results change
  useEffect(() => setHighlight(-1), [debounced]);

  const go = (slug?: string) => {
    setOpen(false);
    if (slug) {
      router.push(`/mod/${slug}`);
    } else if (q.trim()) {
      router.push(`/mods?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) {
      if (e.key === 'Enter') go();
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => Math.min(h + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(h - 1, -1)); }
    else if (e.key === 'Enter') { e.preventDefault(); go(highlight >= 0 ? suggestions[highlight].slug : undefined); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="h-[42px] w-full rounded-[10px] border border-zinc-800 bg-zinc-900 pl-10 pr-10 text-sm font-medium text-white placeholder:text-zinc-500 focus:border-[#ff6a1a]/50 focus:outline-none focus:ring-4 focus:ring-[#ff6a1a]/10"
        aria-label="Search projects"
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
      />
      {isFetching && (
        <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-500" />
      )}

      {open && debounced.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-[12px] border border-zinc-800 bg-[#1a1a1e] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
          {suggestions.length === 0 && !isFetching ? (
            <p className="px-4 py-3 text-xs text-zinc-500">No matches for “{debounced}” — press Enter to browse.</p>
          ) : (
            <>
              <ul role="listbox">
                {suggestions.map((s, i) => (
                  <li key={s.id}>
                    <Link
                      href={`/mod/${s.slug}`}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setHighlight(i)}
                      className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                        highlight === i ? 'bg-[#ff6a1a]/10' : 'hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-zinc-800 ring-1 ring-zinc-700">
                        {s.iconUrl ? (
                          <Image src={s.iconUrl} alt="" fill sizes="36px" className="object-cover" unoptimized />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-black text-white">{s.title[0]}</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">
                          {s.title}
                          <span className="ml-2 rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-black tracking-widest text-zinc-400">
                            {(s.projectType ?? 'MOD').replace('_', ' ')}
                          </span>
                        </p>
                        <p className="truncate text-xs text-zinc-500">{s.description}</p>
                      </div>
                      <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-zinc-400">
                        <TrendingUp className="h-3.5 w-3.5 text-zinc-600" />{formatNumber(s.downloads)}
                      </span>
                      {highlight === i && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-[#ff8c42]" />}
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => go()}
                className="flex w-full items-center justify-center gap-1.5 border-t border-zinc-800 bg-[#141418] py-2.5 text-xs font-black tracking-widest text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                SEE ALL RESULTS FOR “{debounced.toUpperCase()}” <Search className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function useDebounced<T>(value: T, delayMs: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return v;
}

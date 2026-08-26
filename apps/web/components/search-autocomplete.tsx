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
 * Search autocomplete — debounced live suggestions in a dropdown as the
 * user types, with keyboard navigation (↑/↓/Enter/Esc). Implements the
 * ARIA 1.2 combobox pattern: aria-controls/aria-activedescendant on the
 * input, role=option + aria-selected on each suggestion.
 */
export function SearchAutocomplete({
  className = '',
  placeholder = 'Search mods, modpacks, plugins...',
}: {
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
      // Meilisearch-backed /search — typo-tolerant, ~5ms, ranked by relevance
      try {
        const res: any = await sdk.search(debounced.trim(), { limit: 6 });
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        return data.slice(0, 6).map((p: any) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          description: p.description,
          iconUrl: p.iconUrl,
          downloads: p.downloads ?? 0,
          projectType: p.projectType,
          author: p.author,
        }));
      } catch {
        // Fallback to the SQL-backed listing if Meilisearch is unavailable
        const res: any = await sdk.listProjects({ search: debounced.trim(), limit: 6 });
        const data = Array.isArray(res?.data) ? res.data : [];
        return data.map((p: any) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          description: p.description,
          iconUrl: p.iconUrl,
          downloads: p.downloads ?? 0,
          projectType: p.projectType,
          author: p.author,
        }));
      }
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
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(highlight >= 0 ? suggestions[highlight].slug : undefined);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const listboxId = 'search-suggestions';
  const expanded = open && debounced.trim().length >= 2 && suggestions.length > 0;

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <Search className="text-muted-foreground pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-brand focus:ring-brand/20 h-[42px] w-full rounded-[10px] border pl-10 pr-10 text-sm font-medium focus:outline-none focus:ring-4"
        aria-label="Search projects"
        role="combobox"
        aria-expanded={expanded}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={highlight >= 0 ? `search-option-${highlight}` : undefined}
      />
      {isFetching && (
        <Loader2 className="text-muted-foreground absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />
      )}

      {open && debounced.trim().length >= 2 && (
        <div className="border-border bg-popover text-popover-foreground absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-[12px] border shadow-[0_16px_48px_hsl(0_0%_0%/0.35)]">
          {suggestions.length === 0 && !isFetching ? (
            <p className="text-muted-foreground px-4 py-3 text-xs">
              No matches for “{debounced}” — press Enter to browse.
            </p>
          ) : (
            <>
              <ul role="listbox" id={listboxId} aria-label="Search suggestions">
                {suggestions.map((s, i) => (
                  <li
                    key={s.id}
                    role="option"
                    id={`search-option-${i}`}
                    aria-selected={highlight === i}
                  >
                    <Link
                      href={`/mod/${s.slug}`}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setHighlight(i)}
                      className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                        highlight === i ? 'bg-brand/10' : 'hover:bg-accent'
                      }`}
                    >
                      <div className="bg-muted ring-border relative h-9 w-9 shrink-0 overflow-hidden rounded-lg ring-1">
                        {s.iconUrl ? (
                          <Image
                            src={s.iconUrl}
                            alt=""
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="text-foreground flex h-full w-full items-center justify-center text-xs font-black">
                            {s.title[0]}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-sm font-bold">
                          {s.title}
                          <span className="bg-muted text-muted-foreground ml-2 rounded px-1.5 py-0.5 text-[9px] font-black tracking-widest">
                            {(s.projectType ?? 'MOD').replace('_', ' ')}
                          </span>
                        </p>
                        <p className="text-muted-foreground truncate text-xs">{s.description}</p>
                      </div>
                      <span className="text-muted-foreground inline-flex shrink-0 items-center gap-1 text-xs font-bold">
                        <TrendingUp className="text-muted-foreground/70 h-3.5 w-3.5" />
                        {formatNumber(s.downloads)}
                      </span>
                      {highlight === i && (
                        <CornerDownLeft className="text-brand-deep h-3.5 w-3.5 shrink-0" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => go()}
                className="border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-center gap-1.5 border-t py-2.5 text-xs font-black tracking-widest transition-colors"
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

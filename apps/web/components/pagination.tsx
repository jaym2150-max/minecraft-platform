'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * CurseForge-style numbered pagination ("1 2 3 … 500").
 * Renders a window of pages around the current one with ellipses.
 */
export function Pagination({ page, totalPages, onPage }: {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const window = 1; // pages shown either side of current
  const pages: (number | '...')[] = [];

  const push = (p: number | '...') => pages.push(p);
  const inWindow = (p: number) => Math.abs(p - page) <= window;

  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || inWindow(p)) {
      push(p);
    } else if (pages[pages.length - 1] !== '...') {
      push('...');
    }
  }

  const btn =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-bold transition-colors';
  const idle = 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white';
  const active = 'border-[#ff6a1a] bg-[#ff6a1a] text-white cursor-default';
  const disabled = 'border-zinc-800 bg-zinc-900 text-zinc-600 cursor-not-allowed';

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        className={`${btn} ${page === 1 ? disabled : idle}`}
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e-${i}`} className="px-1 text-sm font-bold text-zinc-600">…</span>
        ) : (
          <button
            key={p}
            onClick={() => p !== page && onPage(p)}
            className={`${btn} ${p === page ? active : idle}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ),
      )}

      <button
        className={`${btn} ${page === totalPages ? disabled : idle}`}
        disabled={page === totalPages}
        onClick={() => onPage(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <span className="ml-3 hidden text-xs font-bold tracking-widest text-zinc-500 sm:inline">
        PAGE {page} OF {totalPages}
      </span>
    </nav>
  );
}

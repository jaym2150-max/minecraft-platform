'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Numbered pagination ("1 2 3 … 500").
 * Renders a window of pages around the current one with ellipses.
 * Uses semantic theme tokens so it renders in both light and dark mode.
 */
export function Pagination({
  page,
  totalPages,
  onPage,
}: {
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
  const idle =
    'border-border bg-card text-foreground/80 hover:border-brand/40 hover:bg-accent hover:text-foreground';
  const active = 'border-brand bg-primary text-primary-foreground cursor-default';
  const disabled = 'border-border bg-card text-muted-foreground/50 cursor-not-allowed';

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
          <span key={`e-${i}`} className="text-muted-foreground/60 px-1 text-sm font-bold">
            …
          </span>
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

      <span className="text-muted-foreground ml-3 hidden text-xs font-bold tracking-widest sm:inline">
        PAGE {page} OF {totalPages}
      </span>
    </nav>
  );
}

'use client';

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FacetOption {
  value: string;
  label: string;
  count?: number;
}

export interface FacetFilterProps {
  title: string;
  options: FacetOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  defaultOpen?: boolean;
  searchable?: boolean;
  className?: string;
  emptyMessage?: string;
}

export function FacetFilter({
  title,
  options,
  selected,
  onChange,
  defaultOpen = true,
  searchable = false,
  className,
  emptyMessage = 'No options',
}: FacetFilterProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const clear = () => onChange([]);

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          {title}
          {selected.length > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              {selected.length}
            </span>
          )}
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="border-t px-4 py-3 space-y-2">
          {searchable && options.length > 5 && (
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Filter ${title.toLowerCase()}...`}
              className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          )}
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">{emptyMessage}</p>
          ) : (
            <ul className="space-y-1 max-h-64 overflow-y-auto pr-1">
              {filtered.map((opt) => {
                const checked = selected.includes(opt.value);
                return (
                  <li key={opt.value}>
                    <label className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 cursor-pointer">
                      <span className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(opt.value)}
                          aria-label={opt.label}
                          className="h-4 w-4 rounded border-input text-primary focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <span className="truncate">{opt.label}</span>
                      </span>
                      {typeof opt.count === 'number' && (
                        <span className="text-xs text-muted-foreground shrink-0">{opt.count}</span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
          {selected.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="text-xs text-primary hover:underline mt-1"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default FacetFilter;

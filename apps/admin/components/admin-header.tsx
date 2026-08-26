'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

/**
 * Header search submits to the Projects review queue — the closest real
 * target to "global search" this app exposes. The previous version was a
 * decorative input with no handler and a fake notification bell.
 */
export function AdminHeader() {
  const router = useRouter();
  const [q, setQ] = useState('');

  const submit = () => {
    const s = q.trim();
    router.push(s ? `/projects?q=${encodeURIComponent(s)}` : '/projects');
  };

  return (
    <header className="sticky top-0 z-10 border-b bg-white">
      <div className="flex items-center justify-between px-8 py-4">
        <form
          className="max-w-xl flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          role="search"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              aria-label="Search projects"
              placeholder="Search projects... (Enter)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="focus:ring-brand focus:border-brand w-full rounded-lg border bg-slate-50 py-2 pl-10 pr-4 focus:outline-none focus:ring-2"
            />
          </div>
        </form>
        <div className="flex items-center gap-4">
          <div
            className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium"
            aria-hidden="true"
          >
            A
          </div>
        </div>
      </div>
    </header>
  );
}

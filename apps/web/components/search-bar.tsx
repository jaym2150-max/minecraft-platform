'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/mods?q=${encodeURIComponent(query.trim())}`);
      }
    },
    [query, router],
  );

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
      <input
        type="search"
        placeholder="Search mods..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-lg border pl-9 pr-4 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
      />
    </form>
  );
}

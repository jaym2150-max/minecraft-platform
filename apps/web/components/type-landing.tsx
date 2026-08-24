'use client';

import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Type-specific SEO landing page (/modpacks, /shaders, /plugins).
 * Redirects to the unified /mods browser pre-filtered to one project type.
 * Renders a lightweight skeleton while the router swaps over.
 */
export function TypeLandingRedirect({ type }: { type: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('type', type);
    router.replace(`/mods?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  return (
    <main className="flex-1 flex items-center justify-center py-24">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading {type.toLowerCase()}s…</span>
      </div>
    </main>
  );
}

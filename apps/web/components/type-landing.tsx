'use client';

/**
 * Type-specific browse page — a thin SEO-friendly wrapper around the main
 * /mods browse experience pre-filtered to one project type. Each route
 * (/modpacks, /shaders, /plugins) is its own indexable landing page,
 * mirroring CurseForge's per-category ranking pages.
 */

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProjectType } from '@mcp/types';

export function TypeLandingPage({ type }: { type: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('type', type);
    router.replace(`/mods?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  return null;
}

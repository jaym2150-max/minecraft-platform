import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import HomeClient from '@/components/home/home-client';
import { serverApi } from '@/lib/server-api';
import {
  HOME_KEYS,
  mapHomeProjects,
  mapHomeCollections,
  mapHomeStats,
  type HomeProject,
} from '@/lib/home-data';

/**
 * Homepage — server component that prefetches the catalog/collection/stat
 * queries against the API and dehydrates them into the client's react-query
 * cache. If any prefetch fails (API down, build time, etc.) the client
 * component simply fetches on its own; nothing here can break the render.
 */
export default async function HomePage() {
  const queryClient = new QueryClient();

  const limitProjects = async (path: string): Promise<HomeProject[]> => {
    const data = await serverApi<any>(path);
    const list = Array.isArray(data)
      ? data
      : Array.isArray((data as any)?.data)
        ? (data as any).data
        : [];
    return mapHomeProjects(list);
  };

  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: [...HOME_KEYS.trending(8)],
      queryFn: () => limitProjects('/projects?sort=downloads&limit=8'),
      staleTime: 60_000,
    }),
    queryClient.prefetchQuery({
      queryKey: [...HOME_KEYS.updated(5)],
      queryFn: () => limitProjects('/projects?sort=updated&limit=5'),
      staleTime: 60_000,
    }),
    queryClient.prefetchQuery({
      queryKey: [...HOME_KEYS.collections(3)],
      queryFn: async () => {
        const data = await serverApi<any>('/collections?limit=3');
        const list = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.data)
            ? (data as any).data
            : [];
        return mapHomeCollections(list, 3);
      },
      staleTime: 60_000,
    }),
    queryClient.prefetchQuery({
      queryKey: [...HOME_KEYS.categories],
      queryFn: async () => {
        const data = await serverApi<any>('/categories');
        const list = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.data)
            ? (data as any).data
            : [];
        return list.slice(0, 8);
      },
      staleTime: 300_000,
    }),
    queryClient.prefetchQuery({
      queryKey: [...HOME_KEYS.stats],
      queryFn: async () => mapHomeStats(await serverApi<any>('/statistics')),
      staleTime: 60_000,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeClient />
    </HydrationBoundary>
  );
}

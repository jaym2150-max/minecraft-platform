import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DiscoverClient } from '@/components/discover-client';
import { serverApi } from '@/lib/server-api';

export const revalidate = 3600;

interface RouteParams {
  version: string;
}

const MIN_PROJECTS_FOR_INDEX = 5;

/**
 * Build-time / ISR param list from the catalog's Minecraft versions.
 * Versions that no longer exist fall through to a 404 (notFound()).
 */
export async function generateStaticParams() {
  const data = await serverApi<any[]>('/minecraft-versions');
  if (!data || !Array.isArray(data)) return [];
  return data
    .filter((v: any) => v?.version && typeof v.version === 'string')
    .map((v: any) => ({ version: v.version }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { version } = await params;
  const decoded = decodeURIComponent(version);
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';
  const canonical = `${siteUrl}/versions/${decoded}`;
  const title = `Minecraft ${decoded} mods, modpacks, shaders & plugins`;
  const description = `Browse mods, modpacks, resource packs, data packs, shaders and plugins compatible with Minecraft ${decoded}. Filter by loader, category and environment.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      title,
      description,
      url: canonical,
      siteName: 'Minecraft Platform',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function VersionPage({ params }: { params: Promise<RouteParams> }) {
  const { version } = await params;
  const decoded = decodeURIComponent(version);

  // Validate version is in our catalog before rendering — avoids crawling of
  // random paths like /versions/foo-bar.
  const versions = await serverApi<any[]>('/minecraft-versions').catch(() => null);
  const known = Array.isArray(versions) && versions.some((v: any) => v?.version === decoded);
  if (!known) notFound();

  const sample: any = await serverApi(
    `/projects?gameVersions=${encodeURIComponent(decoded)}&limit=1`,
  );
  const total: number = sample?.meta?.total ?? 0;
  const thinPage = total < MIN_PROJECTS_FOR_INDEX;

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';
  const canonical = `${siteUrl}/versions/${decoded}`;
  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Minecraft ${decoded} projects`,
    description: `Projects compatible with Minecraft ${decoded}.`,
    url: canonical,
    isPartOf: { '@type': 'WebSite', name: 'Minecraft Platform', url: siteUrl },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: total,
    },
  };

  return (
    <>
      {thinPage && <meta name="robots" content="noindex,follow" />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <DiscoverClient
        filters={{
          gameVersions: [decoded],
          loaders: [],
          categories: [],
          environments: [],
          licenseIds: [],
          projectTypes: [],
        }}
        heading={`Minecraft ${decoded} projects`}
        description={`The top projects compatible with Minecraft ${decoded}. Sortable by downloads, popularity and last update.`}
        emptyHint={`No Minecraft ${decoded} projects have been indexed yet — try a different version or check back later.`}
        related={[
          { href: '/mods', label: 'Browse all projects' },
          { href: '/loaders/fabric', label: 'Fabric' },
          { href: '/loaders/forge', label: 'Forge' },
        ]}
      />
    </>
  );
}

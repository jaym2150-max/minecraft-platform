import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DiscoverClient } from '@/components/discover-client';
import { LOADER_SLUGS, findLoader } from '@/lib/loaders';
import { serverApi } from '@/lib/server-api';

export const revalidate = 3600;
export const dynamicParams = false;

interface RouteParams {
  loader: string;
}

const MIN_PROJECTS_FOR_INDEX = 5;

export async function generateStaticParams() {
  return LOADER_SLUGS.map((l) => ({ loader: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { loader } = await params;
  const entry = findLoader(loader);
  if (!entry) return { title: 'Loader not found' };

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';
  const canonical = `${siteUrl}/loaders/${entry.slug}`;
  const title = `${entry.label} mods, modpacks, shaders & plugins — Minecraft ${entry.label}`;
  const description = `Discover the best ${entry.label} projects for Minecraft. Browse community-tested ${entry.label} mods, modpacks, resource packs, data packs, shaders, and plugins — every version, every release type.`;

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

export default async function LoaderPage({ params }: { params: Promise<RouteParams> }) {
  const { loader } = await params;
  const entry = findLoader(loader);
  if (!entry) notFound();

  // Server-side head request to decide indexability without inflating the
  // page render with full project data.
  const sample: any = await serverApi(`/projects?loaders=${entry.type}&limit=1`).catch(() => null);
  const total: number = sample?.meta?.total ?? 0;

  const thinPage = total < MIN_PROJECTS_FOR_INDEX;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';
  const canonical = `${siteUrl}/loaders/${entry.slug}`;

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${entry.label} Minecraft projects`,
    description: `Curated ${entry.label} mods, modpacks and plugins.`,
    url: canonical,
    isPartOf: { '@type': 'WebSite', name: 'Minecraft Platform', url: siteUrl },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: total,
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
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
          loaders: [entry.type],
          categories: [],
          gameVersions: [],
          environments: [],
          licenseIds: [],
          projectTypes: [],
        }}
        heading={`${entry.label} projects`}
        description={`The most-downloaded ${entry.label} mods, modpacks, resource packs, shaders, data packs and plugins — curated by usage and community ratings.`}
        emptyHint={`No ${entry.label} projects have been indexed yet — check back after the next sync.`}
        related={[
          { href: '/mods', label: 'Browse all projects' },
          { href: '/versions/1.21.1', label: 'Minecraft 1.21.1' },
        ]}
      />
    </>
  );
}

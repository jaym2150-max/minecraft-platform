import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DiscoverClient } from '@/components/discover-client';
import { serverApi } from '@/lib/server-api';

export const revalidate = 3600;

interface RouteParams {
  slug: string;
}

const MIN_PROJECTS_FOR_INDEX = 5;

export async function generateStaticParams() {
  const data = await serverApi<any[]>('/categories');
  if (!data || !Array.isArray(data)) return [];
  return data.filter((c: any) => typeof c?.slug === 'string').map((c: any) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const data = await serverApi<any[]>(`/categories`);
  const category =
    Array.isArray(data) && data.find((c: any) => c?.slug === decoded)
      ? data.find((c: any) => c.slug === decoded)
      : null;
  if (!category) return { title: 'Category not found' };

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';
  const canonical = `${siteUrl}/categories/${category.slug}`;
  const title = `${category.name} mods, modpacks & plugins — Minecraft ${category.name}`;
  const description =
    category.description ??
    `Discover the best ${category.name.toLowerCase()} projects for Minecraft. Hand-picked mods, modpacks, resource packs, shaders and plugins in the ${category.name.toLowerCase()} category.`;

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

export default async function CategoryPage({ params }: { params: Promise<RouteParams> }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const data = await serverApi<any[]>('/categories');
  const category = Array.isArray(data) ? data.find((c: any) => c?.slug === decoded) : null;
  if (!category) notFound();

  const sample: any = await serverApi(
    `/projects?categories=${encodeURIComponent(category.id)}&limit=1`,
  );
  const total: number = sample?.meta?.total ?? 0;
  const thinPage = total < MIN_PROJECTS_FOR_INDEX;

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';
  const canonical = `${siteUrl}/categories/${category.slug}`;
  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} Minecraft projects`,
    description: `${category.name} mods, modpacks and plugins.`,
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
          categories: [category.id],
          loaders: [],
          gameVersions: [],
          environments: [],
          licenseIds: [],
          projectTypes: [],
        }}
        heading={`${category.name} projects`}
        description={
          category.description ??
          `The most-downloaded ${category.name.toLowerCase()} mods, modpacks, resource packs, shaders, data packs and plugins.`
        }
        emptyHint={`No ${category.name.toLowerCase()} projects have been indexed yet.`}
        related={[
          { href: '/mods', label: 'Browse all projects' },
          { href: '/loaders/fabric', label: 'Fabric' },
          { href: '/loaders/forge', label: 'Forge' },
        ]}
      />
    </>
  );
}

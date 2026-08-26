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
  const data = await serverApi<any[]>('/tags');
  if (!data || !Array.isArray(data)) return [];
  return data.filter((t: any) => typeof t?.slug === 'string').map((t: any) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const data = await serverApi<any[]>(`/tags`);
  const tag = Array.isArray(data) ? data.find((t: any) => t?.slug === decoded) : null;
  if (!tag) return { title: 'Tag not found' };

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';
  const canonical = `${siteUrl}/tags/${tag.slug}`;
  const title = `${tag.name} mods — Minecraft ${tag.name}`;
  const description = tag.description ?? `Discover ${tag.name.toLowerCase()} mods and modpacks.`;

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
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function TagPage({ params }: { params: Promise<RouteParams> }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const data = await serverApi<any[]>('/tags');
  const tag = Array.isArray(data) ? data.find((t: any) => t?.slug === decoded) : null;
  if (!tag) notFound();

  const sample: any = await serverApi(`/projects?tags=${encodeURIComponent(tag.slug)}&limit=1`);
  const total: number = sample?.meta?.total ?? 0;
  const thinPage = total < MIN_PROJECTS_FOR_INDEX;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';
  const canonical = `${siteUrl}/tags/${tag.slug}`;
  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${tag.name} Minecraft projects`,
    description: `${tag.name} mods and modpacks.`,
    url: canonical,
    isPartOf: { '@type': 'WebSite', name: 'Minecraft Platform', url: siteUrl },
    mainEntity: { '@type': 'ItemList', numberOfItems: total },
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
          tags: [tag.slug],
          categories: [],
          loaders: [],
          gameVersions: [],
          environments: [],
          licenseIds: [],
          projectTypes: [],
        }}
        heading={`${tag.name} projects`}
        description={
          tag.description ?? `The most-downloaded ${tag.name.toLowerCase()} mods and modpacks.`
        }
        emptyHint={`No ${tag.name.toLowerCase()} projects yet.`}
        related={[
          { href: '/mods', label: 'Browse all projects' },
          { href: '/loaders/fabric', label: 'Fabric' },
        ]}
      />
    </>
  );
}

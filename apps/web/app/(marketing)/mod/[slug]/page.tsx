import type { Metadata } from 'next';
import { serverApi } from '@/lib/server-api';
import ModDetailClient from './client';

interface RouteParams {
  slug: string;
}

/**
 * Mod detail page — server component shell.
 *
 * It provides crawler/social metadata (title, description, OG image) from
 * the API on the server, then delegates all interactive behavior to the
 * client component. Data loading stays client-driven via useProject; this
 * wrapper ensures search engines and link previews get real content even
 * though the page body hydrates client-side.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  const project = await serverApi<any>(`/projects/${encodeURIComponent(decoded)}`);
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';
  const canonical = `${siteUrl}/mod/${decoded}`;
  if (!project) {
    return {
      title: decoded,
      description: `View ${decoded} on Minecraft Platform.`,
      alternates: { canonical },
      robots: { index: false, follow: true },
    };
  }

  const title = `${project.title} — Minecraft ${humanizeType(project.projectType)}`;
  const description =
    project.description ??
    'Download this Minecraft mod. Malware-scanned, every loader, every version.';
  const images = project.iconUrl
    ? [{ url: project.iconUrl, width: 256, height: 256, alt: project.title }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      title,
      description,
      url: canonical,
      images,
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title,
      description,
      images,
    },
  };
}

function humanizeType(t?: string): string {
  if (!t) return 'mod';
  switch (t) {
    case 'MODPACK':
      return 'modpack';
    case 'RESOURCE_PACK':
      return 'resource pack';
    case 'DATA_PACK':
      return 'data pack';
    case 'SHADER':
      return 'shader';
    case 'PLUGIN':
      return 'plugin';
    default:
      return 'mod';
  }
}

export default async function ModDetailPage({ params }: { params: Promise<RouteParams> }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const project = await serverApi<any>(`/projects/${encodeURIComponent(decoded)}`);
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';
  const canonical = `${siteUrl}/mod/${decoded}`;

  // SoftwareApplication JSON-LD — only emit when we actually have project
  // metadata; a 404 page should never advertise non-existent downloads.
  const jsonLdBlocks: object[] = [];
  if (project) {
    const authorUsername = project.author?.username ?? project.authorUsername ?? 'unknown';
    const app: any = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: project.title,
      description: project.description,
      url: canonical,
      applicationCategory: 'GameApplication',
      operatingSystem: 'Minecraft Java Edition',
      softwareVersion: project.latestVersion ?? undefined,
      image: project.iconUrl ?? undefined,
      author: { '@type': 'Person', name: authorUsername },
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
      downloadUrl: canonical,
      dateModified: project.updatedAt ?? undefined,
      keywords:
        [
          ...(Array.isArray(project.loaders) ? project.loaders : []),
          ...(Array.isArray(project.gameVersions) ? project.gameVersions : []),
          project.category?.name,
        ]
          .filter(Boolean)
          .join(', ') || undefined,
    };
    jsonLdBlocks.push(app);

    if (typeof project.ratingAverage === 'number' && project.ratingCount > 0) {
      jsonLdBlocks.push({
        '@context': 'https://schema.org',
        '@type': 'AggregateRating',
        itemReviewed: { '@type': 'SoftwareApplication', name: project.title, url: canonical },
        ratingValue: project.ratingAverage,
        reviewCount: project.ratingCount,
        bestRating: 5,
        worstRating: 1,
      });
    }

    jsonLdBlocks.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Projects', item: `${siteUrl}/mods` },
        {
          '@type': 'ListItem',
          position: 3,
          name: project.title,
          item: canonical,
        },
      ],
    });
  }

  return (
    <>
      {jsonLdBlocks.map((block, i) => (
        <script
          key={`ld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
      <ModDetailClient />
    </>
  );
}

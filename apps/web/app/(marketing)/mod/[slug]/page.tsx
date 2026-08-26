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
  if (!project) {
    return { title: decoded, description: `View ${decoded} on Minecraft Platform.` };
  }

  const title = `${project.title} — Minecraft Mod`;
  const description =
    project.description ??
    'Download this Minecraft mod. Malware-scanned, every loader, every version.';
  const images = project.iconUrl
    ? [{ url: project.iconUrl, width: 256, height: 256, alt: project.title }]
    : undefined;

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      title,
      description,
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

export default async function ModDetailPage({ params }: { params: Promise<RouteParams> }) {
  // The client component reads the slug via useParams; awaiting params here
  // just marks the route dynamic so metadata reflects the live slug.
  await params;
  return <ModDetailClient />;
}

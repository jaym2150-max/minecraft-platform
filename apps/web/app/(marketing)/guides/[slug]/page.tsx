import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverApi } from '@/lib/server-api';

export const revalidate = 3600;

interface Params {
  slug: string;
}

export async function generateStaticParams() {
  const data: any = await serverApi('/guides?limit=50');
  const list: any[] = Array.isArray(data)
    ? data
    : Array.isArray((data as any)?.data)
      ? (data as any).data
      : [];
  return list.filter((g: any) => g?.slug).map((g: any) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const guide: any = await serverApi(`/guides/${encodeURIComponent(slug)}`);
  if (!guide) return { title: 'Guide not found' };
  const g = (guide as any)?.data ?? guide;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';
  return {
    title: `${g.title} — Guide`,
    description: g.excerpt ?? g.title,
    alternates: { canonical: `${siteUrl}/guides/${g.slug}` },
    openGraph: {
      type: 'article',
      title: g.title,
      description: g.excerpt,
      url: `${siteUrl}/guides/${g.slug}`,
    },
  };
}

export default async function GuideDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const guide: any = await serverApi(`/guides/${encodeURIComponent(slug)}`);
  const g = (guide as any)?.data ?? guide;
  if (!g || !g.slug) notFound();
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: g.title,
    description: g.excerpt,
    url: `${siteUrl}/guides/${g.slug}`,
    author: g.author ? { '@type': 'Person', name: g.author.username } : undefined,
    datePublished: g.createdAt,
    dateModified: g.updatedAt,
  };
  return (
    <article className="mx-auto max-w-3xl space-y-4 p-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-3xl font-bold">{g.title}</h1>
      <div className="text-muted-foreground text-sm">
        {g.category ?? 'guide'} · {new Date(g.createdAt).toLocaleDateString()} · {g.views ?? 0}{' '}
        views
      </div>
      {g.excerpt && <p className="text-muted-foreground">{g.excerpt}</p>}
      <div className="prose max-w-none whitespace-pre-wrap text-sm leading-6">{g.body}</div>
    </article>
  );
}

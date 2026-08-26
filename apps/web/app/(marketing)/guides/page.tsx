import type { Metadata } from 'next';
import Link from 'next/link';
import { serverApi } from '@/lib/server-api';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';

export const metadata: Metadata = {
  title: 'Guides — Minecraft Mod Installation & Tips',
  description:
    'Installation guides, tutorials, best-mod lists and troubleshooting for Minecraft mods and modpacks.',
  alternates: { canonical: `${siteUrl}/guides` },
};

export const revalidate = 3600;

export default async function GuidesPage() {
  const guides: any = await serverApi('/guides?limit=20');
  const list: any[] = Array.isArray(guides)
    ? guides
    : Array.isArray((guides as any)?.data)
      ? (guides as any).data
      : [];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header>
        <h1 className="text-3xl font-bold">Guides</h1>
        <p className="text-muted-foreground">Installation, optimization and troubleshooting.</p>
      </header>
      {list.length === 0 ? (
        <p className="text-muted-foreground text-sm">No guides published yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((g: any) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="hover:bg-muted rounded border p-4"
            >
              <div className="text-sm font-semibold">{g.title}</div>
              <div className="text-muted-foreground mt-1 line-clamp-2 text-xs">{g.excerpt}</div>
              <div className="text-muted-foreground mt-2 text-xs">
                {g.category ?? 'guide'} · {new Date(g.createdAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

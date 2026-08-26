import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/mods`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${siteUrl}/collections`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${siteUrl}/pricing`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${siteUrl}/faq`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${siteUrl}/docs`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/auth/login`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/auth/register`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
    const res = await fetch(`${apiUrl}/api/v1/projects?limit=100`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return staticRoutes;
    const body = await res.json();
    const projects = Array.isArray(body?.data) ? body.data : [];
    const projectRoutes: MetadataRoute.Sitemap = projects.map((p: any) => ({
      url: `${siteUrl}/mod/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
    const usernames = Array.from(
      new Set(
        projects
          .map((p: any) => p.author?.username)
          .filter((u: unknown): u is string => typeof u === 'string'),
      ),
    );
    const userRoutes: MetadataRoute.Sitemap = usernames.map((username) => ({
      url: `${siteUrl}/user/${username}`,
      changeFrequency: 'daily' as const,
      priority: 0.4,
    }));
    return [...staticRoutes, ...projectRoutes, ...userRoutes];
  } catch {
    return staticRoutes;
  }
}

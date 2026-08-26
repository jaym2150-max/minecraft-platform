import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const LOADER_SLUGS = [
  'fabric',
  'forge',
  'neoforge',
  'quilt',
  'bukkit',
  'spigot',
  'paper',
  'purpur',
];

async function safeJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${apiUrl}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const body = await res.json();
    return (body?.data ?? body) as T;
  } catch {
    return null;
  }
}

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

  const loaderRoutes: MetadataRoute.Sitemap = LOADER_SLUGS.map((slug) => ({
    url: `${siteUrl}/loaders/${slug}`,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const [projects, categories, minecraftVersions, tags, guides] = await Promise.all([
    safeJson<any[]>('/projects?limit=1000'),
    safeJson<any[]>('/categories'),
    safeJson<any[]>('/minecraft-versions'),
    safeJson<any[]>('/tags'),
    safeJson<any[]>('/guides?limit=100'),
  ]);

  const projectRoutes: MetadataRoute.Sitemap = Array.isArray(projects)
    ? projects.map((p: any) => ({
        url: `${siteUrl}/mod/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
        changeFrequency: 'weekly',
        priority: 0.8,
      }))
    : [];

  const categoryRoutes: MetadataRoute.Sitemap = Array.isArray(categories)
    ? categories.map((c: any) => ({
        url: `${siteUrl}/categories/${c.slug}`,
        changeFrequency: 'daily',
        priority: 0.7,
      }))
    : [];

  const versionRoutes: MetadataRoute.Sitemap = Array.isArray(minecraftVersions)
    ? minecraftVersions.map((v: any) => ({
        url: `${siteUrl}/versions/${v.version}`,
        changeFrequency: 'weekly',
        priority: 0.6,
      }))
    : [];

  const tagRoutes: MetadataRoute.Sitemap = Array.isArray(tags)
    ? tags.map((t: any) => ({
        url: `${siteUrl}/tags/${t.slug}`,
        changeFrequency: 'daily',
        priority: 0.7,
      }))
    : [];

  const guideRoutes: MetadataRoute.Sitemap = Array.isArray(guides)
    ? guides.map((g: any) => ({
        url: `${siteUrl}/guides/${g.slug}`,
        lastModified: g.updatedAt ? new Date(g.updatedAt) : undefined,
        changeFrequency: 'weekly',
        priority: 0.6,
      }))
    : [];

  const usernames = Array.isArray(projects)
    ? Array.from(
        new Set(
          projects
            .map((p: any) => p.author?.username)
            .filter((u: unknown): u is string => typeof u === 'string'),
        ),
      )
    : [];
  const userRoutes: MetadataRoute.Sitemap = usernames.map((username) => ({
    url: `${siteUrl}/user/${username}`,
    changeFrequency: 'daily',
    priority: 0.4,
  }));

  return [
    ...staticRoutes,
    ...loaderRoutes,
    ...categoryRoutes,
    ...versionRoutes,
    ...tagRoutes,
    ...guideRoutes,
    ...projectRoutes,
    ...userRoutes,
  ];
}

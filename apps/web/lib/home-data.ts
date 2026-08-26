/**
 * Shared query keys + mappers for the homepage. Used by BOTH the RSC
 * prefetch in app/page.tsx (server) and the react-query hooks in the
 * client component — identical keys/shapes are what make hydration work.
 */
import type { Project } from '@mcp/types';

export const HOME_KEYS = {
  trending: (limit: number) => ['home', 'trending', limit] as const,
  updated: (limit: number) => ['home', 'updated', limit] as const,
  collections: (limit: number) => ['home', 'collections', limit] as const,
  categories: ['home', 'categories'] as const,
  stats: ['home', 'stats'] as const,
};

export interface HomeProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  downloads: number;
  views: number;
  author: { username: string };
  iconUrl?: string;
  categoryName?: string;
}

export function mapHomeProjects(list: Project[] | any[]): HomeProject[] {
  return list.map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    downloads: p.downloads ?? 0,
    views: p.views ?? 0,
    author: p.author ?? { username: 'Unknown' },
    iconUrl: p.iconUrl,
    categoryName: p.category?.name ?? p.categoryName,
  }));
}

export interface HomeCollection {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  projectCount: number;
  user?: { username?: string };
  iconUrl?: string;
}

export function mapHomeCollections(list: any[], limit: number): HomeCollection[] {
  return list.slice(0, limit).map((c: any) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    isPublic: c.isPublic ?? true,
    projectCount: c.projectCount ?? c.projects?.length ?? 0,
    user: c.user,
    iconUrl: c.iconUrl,
  }));
}

export interface HomeStats {
  projects: number;
  downloads: number;
  users: number;
}

export function mapHomeStats(d: any): HomeStats {
  return { projects: d?.projects ?? 0, downloads: d?.downloads ?? 0, users: d?.users ?? 0 };
}

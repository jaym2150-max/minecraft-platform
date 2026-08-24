'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { sdk } from '@/services/api';
import { formatNumber, timeAgo } from '@mcp/utils/helpers';
import type {
  Project,
  ProjectVersion,
  DependencyInfo,
  TeamMemberInfo,
} from '@mcp/types';
import { VersionStatus } from '@mcp/types';

// ── Types exported for the page ──

export interface VersionDisplay {
  id: string;
  version: string;
  loader: string;
  loaderColor: string;
  minecraft: string;
  updated: string;
  updatedAt: string;
  downloads: string;
  downloadsRaw: number;
  status: 'approved' | 'pending' | 'rejected';
  changelog?: string;
  fileUrl: string;
  fileSize: number;
  hash?: string;
}

export interface DependencyDisplay {
  name: string;
  slug: string;
  required: boolean;
}

export interface TeamDisplay {
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface RelatedMod {
  title: string;
  slug: string;
  description: string;
  downloads: number;
  iconUrl?: string;
}

export interface GalleryItem {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  width?: number;
  height?: number;
  order: number;
}

export interface ProjectData {
  id: string;
  title: string;
  slug: string;
  description: string;
  body?: string;
  iconUrl?: string;
  coverUrl?: string;
  sourceUrl?: string;
  wikiUrl?: string;
  discordUrl?: string;
  downloads: number;
  views: number;
  categoryName?: string;
  author: { username: string; avatarUrl?: string };
  createdAt: string;
  updatedAt: string;
  loaders: string[];
  galleryImages?: GalleryItem[];
}

export interface UseProjectResult {
  project: ProjectData | null;
  versions: VersionDisplay[];
  dependencies: DependencyDisplay[];
  team: TeamDisplay[];
  relatedMods: RelatedMod[];
  loading: boolean;
  error: string | null;
  notFound: boolean;
  refetch: () => void;
}

// ── Helpers ──

function getLoaderColor(loader: string): string {
  const map: Record<string, string> = {
    FABRIC: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    FORGE: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    NEOFORGE: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    QUILT: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    BUKKIT: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    SPIGOT: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    PAPER: 'bg-red-500/10 text-red-600 dark:text-red-400',
    PURPUR: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  };
  return map[loader.toUpperCase()] ?? 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
}

function getLoaderDisplay(loader: string): string {
  const map: Record<string, string> = {
    FABRIC: 'Fabric',
    FORGE: 'Forge',
    NEOFORGE: 'NeoForge',
    QUILT: 'Quilt',
    BUKKIT: 'Bukkit',
    SPIGOT: 'Spigot',
    PAPER: 'Paper',
    PURPUR: 'Purpur',
  };
  return map[loader.toUpperCase()] ?? loader;
}

function mapVersionStatus(status: VersionStatus): VersionDisplay['status'] {
  switch (status) {
    case VersionStatus.APPROVED:
      return 'approved';
    case VersionStatus.SUBMITTED:
    case VersionStatus.DRAFT:
      return 'pending';
    case VersionStatus.REJECTED:
      return 'rejected';
  }
}

// ── Hook ──

export function useProject(slug: string): UseProjectResult {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [versions, setVersions] = useState<VersionDisplay[]>([]);
  const [dependencies, setDependencies] = useState<DependencyDisplay[]>([]);
  const [team, setTeam] = useState<TeamDisplay[]>([]);
  const [relatedMods, setRelatedMods] = useState<RelatedMod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!slug) return;

    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      // Fetch project
      const projectRes = await sdk.getProject(slug);
      if (controller.signal.aborted) return;
      const p = projectRes.data;

      // Determine loaders from latest version or fallback
      const loaders = (p as any).loaders?.length
        ? (p as any).loaders.map((l: any) =>
            typeof l === 'string' ? l : l.type || '',
          )
        : [];

  setProject({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    body: p.body,
    iconUrl: p.iconUrl,
    coverUrl: p.coverUrl,
    sourceUrl: p.sourceUrl,
    downloads: p.downloads,
    views: p.views,
    author: p.author ?? { username: 'Unknown' },
    categoryName: (p as any).category?.name,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    loaders,
    galleryImages: (p as any).galleryImages ?? [],
  });

      // Fetch versions, dependencies, team, and related mods in parallel
      const [versionsRes, depsRes, teamRes, relatedRes] = await Promise.allSettled([
        sdk.getProjectVersions(p.id),
        sdk.getProjectDependencies(p.id),
        sdk.getProjectTeam(p.id),
        sdk.getProjectRelated(slug),
      ]);
      if (controller.signal.aborted) return;

      // Versions
      if (versionsRes.status === 'fulfilled') {
        const vData = versionsRes.value.data ?? versionsRes.value;
        const vList = Array.isArray(vData) ? vData : [];
        setVersions(
          vList.map((v: ProjectVersion) => ({
            id: v.id,
            version: v.version,
            loader: v.loaders?.length ? getLoaderDisplay(v.loaders[0] as string) : 'Fabric',
            loaderColor: v.loaders?.length ? getLoaderColor(v.loaders[0] as string) : getLoaderColor('FABRIC'),
            minecraft: (v as any).minecraftVersion ?? '',
            updated: timeAgo(v.updatedAt),
            updatedAt: v.updatedAt,
            downloads: formatNumber(v.downloads),
            downloadsRaw: v.downloads,
            status: mapVersionStatus(v.status),
            changelog: v.changelog,
            fileUrl: v.fileUrl,
            fileSize: v.fileSize,
            hash: v.hash,
          })),
        );
      }

      // Dependencies
      if (depsRes.status === 'fulfilled' && depsRes.value) {
        const dData = depsRes.value.data ?? depsRes.value;
        const dList = Array.isArray(dData) ? dData : [];
        setDependencies(
          dList.map((d: DependencyInfo) => ({
            name: d.name,
            slug: d.slug,
            required: d.required,
          })),
        );
      }

      // Team
      if (teamRes.status === 'fulfilled' && teamRes.value) {
        const tData = teamRes.value.data ?? teamRes.value;
        const tList = Array.isArray(tData) ? tData : [];
        setTeam(
          tList.map((m: TeamMemberInfo) => ({
            name: m.name,
            role: m.role,
            avatarUrl: m.avatarUrl,
          })),
        );
      }

      // Related mods
      if (relatedRes.status === 'fulfilled' && relatedRes.value) {
        const rData = relatedRes.value.data ?? [];
        const rList = Array.isArray(rData) ? rData : [];
        setRelatedMods(
          rList.slice(0, 4).map((r: Project) => ({
            title: r.title,
            slug: r.slug,
            description: r.description,
            downloads: r.downloads,
            iconUrl: r.iconUrl,
          })),
        );
      }
    } catch (err: any) {
      if (controller.signal.aborted) return;
      if (err?.statusCode === 404) {
        setNotFound(true);
      } else {
        setError(err?.message || 'Failed to load project');
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchData]);

  return {
    project,
    versions,
    dependencies,
    team,
    relatedMods,
    loading,
    error,
    notFound,
    refetch: fetchData,
  };
}

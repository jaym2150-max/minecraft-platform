'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Download, Loader2, ExternalLink } from 'lucide-react';
import { Badge } from '@mcp/ui/components/badge';
import type { Project } from '@mcp/types';
import { formatNumber } from '@mcp/utils/helpers';
import { sdk } from '@/services/api';

interface ProjectCardProps {
  project: Project;
}

/**
 * Project card with CurseForge-style inline Download button. The button
 * fetches the latest version's file URL and opens it directly — no need
 * to visit the detail page first.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  const [dlState, setDlState] = useState<'idle' | 'loading' | 'done'>('idle');

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dlState === 'loading') return;
    setDlState('loading');
    try {
      const res: any = await sdk.getProjectVersions(project.id, {});
      const versions = Array.isArray(res?.data) ? res.data : [];
      const latest = versions[0];
      if (!latest?.id) {
        window.open(`/mod/${project.slug}`, '_blank');
        return;
      }
      // Public download endpoint returns the pre-signed file URL
      const dl = await fetch(`/api/v1/versions/${latest.id}/download`, {
        credentials: 'include',
      });
      if (dl.ok) {
        const body = await dl.json().catch(() => null);
        const url: string | undefined = body?.data?.fileUrl ?? body?.data?.url ?? body?.fileUrl;
        if (url) {
          window.open(url, '_blank', 'noopener,noreferrer');
          setDlState('done');
          setTimeout(() => setDlState('idle'), 1500);
          return;
        }
      }
      // fallback: detail page download section
      window.open(`/mod/${project.slug}`, '_blank');
    } catch {
      window.open(`/mod/${project.slug}`, '_blank');
    } finally {
      setDlState('idle');
    }
  };

  return (
    <div className="bg-card group relative rounded-xl border p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/mod/${project.slug}`} className="block">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 group-hover:bg-primary/20 relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl transition-colors">
            {project.iconUrl ? (
              <Image
                src={project.iconUrl}
                alt={project.title}
                fill
                sizes="64px"
                className="h-full w-full rounded-xl object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <span
              className="text-primary absolute inset-0 flex items-center justify-center text-2xl font-bold"
              style={{ display: project.iconUrl ? 'none' : 'flex' }}
            >
              {project.title[0]}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="group-hover:text-primary truncate font-semibold transition-colors">
              {project.title}
            </h3>
            <p className="text-muted-foreground truncate text-sm">
              by {project.author?.username || 'Unknown'}
            </p>
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{project.description}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Badge variant="secondary">
            <Download className="mr-1 h-3 w-3" />
            {formatNumber(project.downloads)}
          </Badge>
          {project.latestVersion && <Badge variant="outline">{project.latestVersion}</Badge>}
        </div>
      </Link>

      {/* Inline download — always visible on touch/small screens (there is
          no hover there), revealed on hover for pointer devices at md+. */}
      <button
        onClick={handleDownload}
        disabled={dlState === 'loading'}
        aria-label={`Download ${project.title}${project.latestVersion ? ` v${project.latestVersion}` : ''}`}
        className="bg-primary text-primary-foreground hover:bg-brand-hover absolute right-5 top-5 inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-black tracking-wide opacity-100 shadow-[0_6px_16px_hsl(21_90%_55%/0.35)] transition-all focus:opacity-100 disabled:opacity-60 md:opacity-0 md:group-hover:opacity-100"
      >
        {dlState === 'loading' ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> FETCHING…
          </>
        ) : dlState === 'done' ? (
          <>
            <ExternalLink className="h-3.5 w-3.5" /> OPENED
          </>
        ) : (
          <>
            <Download className="h-3.5 w-3.5" /> DOWNLOAD
          </>
        )}
      </button>
    </div>
  );
}

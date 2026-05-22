import Link from 'next/link';
import { Download } from 'lucide-react';
import { Badge } from '@mcp/ui/components/badge';
import type { Project } from '@mcp/types';
import { formatNumber } from '@mcp/utils/helpers';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/mods/${project.slug}`}
      className="group rounded-xl border bg-card p-6 hover:shadow-lg transition-all hover:-translate-y-1"
    >
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
          {project.iconUrl ? (
            <img src={project.iconUrl} alt={project.title} className="h-full w-full rounded-xl object-cover" />
          ) : (
            <span className="text-2xl font-bold text-primary">{project.title[0]}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            by {project.author?.username || 'Unknown'}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {project.description}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <Badge variant="secondary">
          <Download className="h-3 w-3 mr-1" />
          {formatNumber(project.downloads)}
        </Badge>
        {project.latestVersion && (
          <Badge variant="outline">{project.latestVersion}</Badge>
        )}
      </div>
    </Link>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { Package as PackageIcon, Loader2 } from 'lucide-react';
import { sdk } from '@/services/api';
import { MarkdownRenderer } from '@/components/markdown-renderer';

interface InstallGuidePayload {
  templateId: string;
  loader: string;
  title: string;
  excerpt: string | null;
  body: string;
}

export function InstallGuide({ projectId }: { projectId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['install-guide', projectId],
    queryFn: async () => {
      const res: any = await (sdk as any).getInstallGuideForProject(projectId);
      return (res?.data ?? null) as InstallGuidePayload | null;
    },
    enabled: !!projectId,
    staleTime: 60 * 60_000,
  });

  return (
    <div className="border-border bg-muted/30 mt-6 rounded-lg border p-4">
      <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
        <PackageIcon className="text-primary h-5 w-5" />
        Installation
      </h3>
      {isLoading ? (
        <div className="text-muted-foreground flex items-center gap-2 py-3 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading install guide…
        </div>
      ) : error || !data ? (
        <p className="text-muted-foreground text-sm">
          No install guide is configured for this project yet.
        </p>
      ) : (
        <>
          <p className="text-muted-foreground mb-3 text-sm">
            <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide">
              {data.loader}
            </span>
            {data.excerpt ? <span className="ml-2">{data.excerpt}</span> : null}
          </p>
          <MarkdownRenderer content={data.body} />
        </>
      )}
    </div>
  );
}

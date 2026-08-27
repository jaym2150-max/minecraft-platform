'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  FileText,
  Loader2,
  Package,
  Trash2,
  XCircle,
} from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@mcp/ui/components/card';
import { Badge } from '@mcp/ui/components/badge';
import { Textarea } from '@mcp/ui/components/textarea';
import { formatBytes } from '@mcp/utils/helpers';
import { sdk } from '@/services/api';
import { useAuth } from '@mcp/auth';

interface ReportFile {
  path: string;
  size: number | null;
  hash: { sha1: string | null; sha512: string | null };
  env: { client: string | null; server: string | null };
  firstDownload: string | null;
  resolvedProjectId: string | null;
}
interface Report {
  name: string | null;
  versionId: string | null;
  game: string | null;
  minecraft: string | null;
  loader: string | null;
  fileCount: number;
  totalSize: number;
  byFolder: Record<string, { count: number; size: number }>;
  conflicts: { kind: string; message: string }[];
  files: ReportFile[];
  notes: string[];
}

const SAMPLE = `{
  "format_version": 1,
  "game": "minecraft",
  "version_id": "1.0.0",
  "name": "My Awesome Modpack",
  "summary": "Tech + QoL + tweaks for 1.21",
  "dependencies": { "minecraft": "1.21.1", "fabric-loader": "0.15.0" },
  "files": [
    { "path": "mods/sodium.jar", "fileSize": 1100000, "downloads": ["https://cdn.modrinth.com/data/A/sodium.jar"] },
    { "path": "mods/lithium.jar", "fileSize": 540000, "downloads": ["https://cdn.modrinth.com/data/B/lithium.jar"] },
    { "path": "overrides/README.txt", "fileSize": 240 }
  ]
}`;

export default function ModpackImportClient() {
  const { isAuthenticated, user } = useAuth();
  const [manifest, setManifest] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  const runInspect = async (body = manifest) => {
    if (!body.trim()) {
      setError('Paste a modrinth.index.json first.');
      return;
    }
    setError(null);
    setReport(null);
    setLoading(true);
    try {
      const res: any = await sdk.inspectModpack(body);
      if (res?.data) {
        setReport(res.data as Report);
      } else {
        setError('No report returned.');
      }
    } catch (e: any) {
      setError(e?.message ?? 'Inspect failed');
    } finally {
      setLoading(false);
    }
  };

  const onFile = async (file: File) => {
    const text = await file.text();
    setManifest(text);
    runInspect(text);
  };

  const hasErrors = (report?.conflicts?.length ?? 0) > 0;
  const resolved = (report?.files ?? []).filter((f) => f.resolvedProjectId).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Package className="text-primary h-6 w-6" />
          <h1 className="text-3xl font-bold">Import a Modpack</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Paste a Modrinth{' '}
          <code className="bg-muted rounded px-1 py-0.5 text-xs">modrinth.index.json</code> or
          upload the manifest text. We&apos;ll validate file composition, Minecraft version, and
          loader — and flag any files that don&apos;t match a catalog project.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Manifest
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="border-border hover:bg-muted/40 flex cursor-pointer items-center gap-2 rounded border px-3 py-1.5 text-sm transition-colors">
              <input
                type="file"
                accept="application/json,.json,text/plain"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
              />
              Upload modrinth.index.json
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setManifest(SAMPLE);
                runInspect(SAMPLE);
              }}
            >
              Try sample
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setManifest('');
                setReport(null);
                setError(null);
              }}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Clear
            </Button>
          </div>
          <Textarea
            value={manifest}
            onChange={(e) => setManifest(e.target.value)}
            placeholder='{"format_version":1,"game":"minecraft",...}'
            className="min-h-[260px] font-mono text-xs"
          />
          <div className="flex items-center gap-2">
            <Button onClick={() => runInspect()} disabled={loading || !manifest.trim()}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Package className="mr-2 h-4 w-4" />
              )}
              Validate
            </Button>
            <Button
              variant="default"
              className="bg-emerald-600"
              onClick={async () => {
                if (!manifest.trim()) return;
                setError(null);
                setLoading(true);
                try {
                  const res: any = await sdk.importModpack(manifest, { createDraft: true });
                  const data = res?.data ?? res;
                  if (data?.rolledBack) {
                    setError('Manifest has blocking conflicts — draft was NOT created.');
                  } else if (data?.project?.id) {
                    setError(
                      `Draft project created: ${data.project.slug} (id ${data.project.id}).`,
                    );
                  } else {
                    setError(res?.message ?? 'Imported.');
                  }
                } catch (e: any) {
                  setError(e?.message ?? 'Import failed');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || !manifest.trim()}
            >
              Save as draft
            </Button>
            <span className="text-muted-foreground text-xs">
              {isAuthenticated
                ? `Signed in as ${user?.username ?? 'admin'}`
                : 'Public inspect — save requires admin'}
            </span>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-start gap-2 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {report && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {hasErrors ? (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                )}
                {report.name ?? 'Unnamed modpack'}{' '}
                <span className="text-muted-foreground text-xs">v{report.versionId ?? '?'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <Stat label="Files" value={String(report.fileCount)} />
                <Stat label="Total size" value={formatBytes(report.totalSize)} />
                <Stat label="Minecraft" value={report.minecraft ?? '—'} />
                <Stat label="Loader" value={report.loader ?? '—'} />
              </div>
              {report.notes.length > 0 && (
                <ul className="text-muted-foreground mt-3 list-disc space-y-1 pl-5 text-xs">
                  {report.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {hasErrors && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-amber-700">Conflicts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {report.conflicts.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded border border-amber-200 bg-amber-50 p-2 text-sm text-amber-800"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <span className="font-mono text-xs font-semibold">[{c.kind}]</span>{' '}
                      {c.message}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {Object.keys(report.byFolder).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">File composition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(report.byFolder)
                    .sort((a, b) => b[1].size - a[1].size)
                    .map(([folder, stats]) => (
                      <FolderRow
                        key={folder}
                        folder={folder}
                        count={stats.count}
                        size={stats.size}
                        open={!!openFolders[folder]}
                        onToggle={() => setOpenFolders((s) => ({ ...s, [folder]: !s[folder] }))}
                        files={report.files.filter((f) => f.path.startsWith(`${folder}/`))}
                        resolved={
                          report.files.filter(
                            (f) => f.path.startsWith(`${folder}/`) && f.resolvedProjectId,
                          ).length
                        }
                      />
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Files ({report.files.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-xs">
                {resolved} of {report.files.length} linked to a catalog project.
              </div>
              <div className="mt-2 max-h-[420px] overflow-auto rounded border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr className="text-left">
                      <th className="p-2">Path</th>
                      <th className="p-2">Size</th>
                      <th className="p-2">Env</th>
                      <th className="p-2">Resolved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.files.map((f, i) => (
                      <tr key={i} className="border-t">
                        <td className="truncate p-2 font-mono">{f.path}</td>
                        <td className="whitespace-nowrap p-2 text-right">
                          {f.size ? formatBytes(f.size) : '—'}
                        </td>
                        <td className="whitespace-nowrap p-2">
                          {f.env.client || f.env.server ? (
                            <span className="text-muted-foreground">
                              {f.env.client ?? '—'} / {f.env.server ?? '—'}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-2">
                          {f.resolvedProjectId ? (
                            <Badge variant="secondary">linked</Badge>
                          ) : f.firstDownload ? (
                            <Badge variant="outline">unlinked</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground text-xs uppercase tracking-wide">{label}</div>
      <div className="font-mono text-sm">{value}</div>
    </div>
  );
}

function FolderRow({
  folder,
  count,
  size,
  open,
  onToggle,
  files,
  resolved,
}: {
  folder: string;
  count: number;
  size: number;
  open: boolean;
  onToggle: () => void;
  files: ReportFile[];
  resolved: number;
}) {
  return (
    <div className="border-border rounded border">
      <button
        type="button"
        onClick={onToggle}
        className="hover:bg-muted/40 flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm"
      >
        <span className="flex items-center gap-2">
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? '' : '-rotate-90'}`} />
          <span className="font-mono">{folder}/</span>
          <span className="text-muted-foreground text-xs">
            {count} files · {formatBytes(size)} · {resolved} linked
          </span>
        </span>
      </button>
      {open && files.length > 0 && (
        <div className="border-t">
          <ul className="divide-y">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between px-3 py-1.5 text-xs">
                <span className="truncate font-mono">{f.path}</span>
                <span className="text-muted-foreground ml-2 shrink-0">
                  {f.size ? formatBytes(f.size) : '—'}
                  {f.resolvedProjectId ? ' · linked' : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

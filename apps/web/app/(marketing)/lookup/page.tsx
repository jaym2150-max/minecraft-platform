'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Loader2,
  PackageCheck,
  PackageX,
  ArrowUpRight,
  Download,
  Copy,
  Check,
  Hash as HashIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@mcp/ui/components/input';
import { Button } from '@mcp/ui/components/button';
import { Badge } from '@mcp/ui/components/badge';
import { sdk } from '@/services/api';
import { formatBytes, formatNumber, formatDate } from '@mcp/utils/helpers';
import type { HashAlgorithm } from '@mcp/types';

const ALGORITHMS: { value: HashAlgorithm; label: string }[] = [
  { value: 'sha256', label: 'SHA-256' },
  { value: 'sha1', label: 'SHA-1' },
  { value: 'sha512', label: 'SHA-512' },
];

// The server's hash-lookup returns the full formatted version object (via
// formatVersion), which is a superset of VersionFileLookup. We access it
// loosely here so the UI can show everything (project, version, hashes…).
type LookupResult = Record<string, any> & {
  id?: string;
  version?: string;
  fileUrl?: string;
  fileSize?: number;
  hash?: string;
  hashSha1?: string;
  hashSha512?: string;
  downloads?: number;
  status?: string;
  scanStatus?: string;
  projectId?: string;
  minecraftVersion?: string;
  loaders?: string[];
  createdAt?: string;
  project?: { id?: string; title?: string; slug?: string };
};

export default function LookupPage() {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [hashInput, setHashInput] = useState('');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('sha256');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [bulkInput, setBulkInput] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState<Record<string, LookupResult | null> | null>(null);

  const trimmed = hashInput.trim();

  const handleLookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!trimmed) {
      toast.error('Paste a file hash to look up.');
      return;
    }
    if (!/^[0-9a-fA-F]+$/.test(trimmed)) {
      toast.error('That does not look like a hex hash.');
      return;
    }

    setLoading(true);
    setNotFound(false);
    setResult(null);
    setLatestVersion(null);
    try {
      const res = await sdk.getVersionByHash(trimmed.toLowerCase(), algorithm);
      const data = (res as any)?.data;
      if (!data) {
        setNotFound(true);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      const msg = String(err?.message ?? err);
      if (/not found/i.test(msg)) {
        setNotFound(true);
      } else {
        toast.error(`Lookup failed: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBulkLookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const hashes = bulkInput
      .split(/[\s,]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => /^[0-9a-f]+$/.test(s) && s.length >= 32);
    if (hashes.length === 0) {
      toast.error('Paste one hash per line (hex, at least 32 chars).');
      return;
    }
    if (hashes.length > 50) {
      toast.error('Bulk limited to 50 hashes (API cap).');
      return;
    }
    setBulkLoading(true);
    setBulkResults(null);
    try {
      const res: any = await sdk.getVersionsFromHashes(hashes, algorithm);
      const data = res?.data ?? {};
      // SDK returns map keyed by hash, missing hashes absent
      const map: Record<string, LookupResult | null> = {};
      hashes.forEach((h) => {
        map[h] = (data[h] as LookupResult) ?? null;
      });
      setBulkResults(map);
      const found = Object.values(map).filter(Boolean).length;
      toast.success(`Found ${found}/${hashes.length} files`);
    } catch (err: any) {
      toast.error(`Bulk lookup failed: ${String(err?.message ?? err)}`);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleCheckUpdate = async () => {
    if (!result?.hash) return;
    setCheckingUpdate(true);
    try {
      const res = await sdk.getLatestVersionFromHash(result.hash);
      const data = (res as any)?.data;
      const latest = data?.version ?? null;
      setLatestVersion(latest);
      if (latest && result.version && latest !== result.version) {
        toast.success(`A newer version is available: ${latest}`);
      } else if (latest === result.version) {
        toast.info('You already have the latest version.');
      } else {
        toast.info('No newer version found.');
      }
    } catch (err: any) {
      toast.error(`Update check failed: ${String(err?.message ?? err)}`);
    } finally {
      setCheckingUpdate(false);
    }
  };

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied((c) => (c === label ? null : c)), 1200);
    } catch {
      toast.error('Copy failed');
    }
  };

  const hashRows: { label: string; key: keyof LookupResult; algo: HashAlgorithm }[] = [
    { label: 'SHA-256', key: 'hash', algo: 'sha256' },
    { label: 'SHA-1', key: 'hashSha1', algo: 'sha1' },
    { label: 'SHA-512', key: 'hashSha512', algo: 'sha512' },
  ];

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/5 via-primary/[0.02] to-background">
        <div className="container py-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Hash Lookup</h1>
            <p className="text-muted-foreground mb-4">
              Paste a file&rsquo;s checksum to resolve it back to its project, version, and
              download link — the same hash resolver launchers use to keep mods up to date.
            </p>
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setMode('single')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${mode === 'single' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-muted'}`}
              >
                Single
              </button>
              <button
                onClick={() => setMode('bulk')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${mode === 'bulk' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-muted'}`}
              >
                Bulk (up to 50)
              </button>
              <span className="text-xs text-muted-foreground ml-2">
                {mode === 'bulk' ? 'One hash per line' : 'SHA-256 default'}
              </span>
            </div>
            {mode === 'single' ? (
              <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
                <div className="relative flex-1">
                  <HashIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <textarea
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    placeholder="e.g. 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
                    rows={1}
                    spellCheck={false}
                    className="w-full min-h-12 resize-none rounded-lg border border-input bg-background pl-10 pr-3 py-3 text-sm font-mono shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    aria-label="File hash"
                  />
                </div>
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value as HashAlgorithm)}
                  className="h-12 sm:w-36 rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label="Hash algorithm"
                >
                  {ALGORITHMS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
                <Button type="submit" disabled={loading} className="h-12 gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Look up
                </Button>
              </form>
            ) : (
              <form onSubmit={handleBulkLookup} className="space-y-3 max-w-2xl">
                <div className="relative">
                  <HashIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <textarea
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    placeholder={"Paste hashes, one per line or comma separated\n9f86d081884c... (sha256)\nda4b003... (sha1)\n..."}
                    rows={5}
                    spellCheck={false}
                    className="w-full min-h-28 rounded-lg border border-input bg-background pl-10 pr-3 py-3 text-sm font-mono shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    aria-label="Bulk hashes"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value as HashAlgorithm)}
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                    aria-label="Hash algorithm"
                  >
                    {ALGORITHMS.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" disabled={bulkLoading} className="gap-2">
                    {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Bulk look up
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="container py-10 max-w-3xl">
        {/* Idle - single */}
        {mode === 'single' && !loading && !result && !notFound && (
          <div className="text-center py-16 border rounded-xl bg-card">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <HashIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-1">Enter a hash to begin</h2>
            <p className="text-muted-foreground text-sm">
              We&rsquo;ll match it against every version file and return the project it belongs to.
            </p>
          </div>
        )}
        {/* Idle - bulk */}
        {mode === 'bulk' && !bulkLoading && !bulkResults && (
          <div className="text-center py-16 border rounded-xl bg-card">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <HashIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-1">Bulk lookup</h2>
            <p className="text-muted-foreground text-sm">Paste up to 50 hashes, one per line, to resolve them all at once.</p>
          </div>
        )}

        {/* Loading */}
        {mode === 'single' && loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Resolving hash…
          </div>
        )}
        {mode === 'bulk' && bulkLoading && (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Resolving {bulkInput.split(/[\s,]+/).filter(Boolean).length} hashes…
          </div>
        )}

        {/* Not found */}
        {mode === 'single' && notFound && !loading && (
          <div className="text-center py-16 border rounded-xl bg-card">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <PackageX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-1">No matching file</h2>
            <p className="text-muted-foreground text-sm mb-4">
              No version file shares that {algorithm.toUpperCase()} hash. Double-check the checksum and algorithm.
            </p>
            <Button variant="outline" onClick={() => { setNotFound(false); setHashInput(''); }}>
              Try another hash
            </Button>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 border rounded-xl bg-card p-6">
              <div className="space-y-3 min-w-0">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
                  <PackageCheck className="h-5 w-5 shrink-0" />
                  <span className="font-semibold">Match found</span>
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold truncate">
                    {result.project ? (
                      <Link
                        href={`/mod/${result.project.slug ?? ''}`}
                        className="hover:underline inline-flex items-center gap-1"
                      >
                        {result.project.title ?? result.project.slug}
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ) : (
                      `Project ${result.projectId ?? ''}`
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Version <span className="font-mono">{result.version}</span>
                    {result.status ? <Badge variant="secondary" className="ml-2">{result.status}</Badge> : null}
                    {result.scanStatus ? <Badge variant="outline" className="ml-2">scan: {result.scanStatus}</Badge> : null}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground shrink-0">
                {result.createdAt ? (
                  <div>Uploaded {formatDate(result.createdAt, { dateStyle: 'medium' })}</div>
                ) : null}
                {typeof result.downloads === 'number' ? (
                  <div>{formatNumber(result.downloads)} downloads</div>
                ) : null}
              </div>
            </div>

            {/* Download + update */}
            <div className="flex flex-wrap gap-2">
              {result.fileUrl ? (
                <Button asChild variant="default" className="gap-2">
                  <a href={result.fileUrl} rel="noopener noreferrer" target="_blank">
                    <Download className="h-4 w-4" /> Download file
                  </a>
                </Button>
              ) : null}
              <Button
                variant="outline"
                onClick={handleCheckUpdate}
                disabled={checkingUpdate}
                className="gap-2"
              >
                {checkingUpdate ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
                Check for update
              </Button>
              {latestVersion && latestVersion !== result.version ? (
                <Badge className="self-center gap-1">
                  Newer: {latestVersion}
                </Badge>
              ) : null}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border rounded-xl bg-card p-6 text-sm">
              <Detail label="File size">
                {typeof result.fileSize === 'number' ? formatBytes(result.fileSize) : '—'}
              </Detail>
              <Detail label="Minecraft version">
                {result.minecraftVersion ? (
                  <Badge variant="secondary">MC {result.minecraftVersion}</Badge>
                ) : '—'}
              </Detail>
              <Detail label="Loaders">
                <div className="flex flex-wrap gap-1">
                  {result.loaders?.length
                    ? result.loaders.map((l) => <Badge key={l} variant="outline">{l}</Badge>)
                    : '—'}
                </div>
              </Detail>
              <Detail label="Version ID">
                <span className="font-mono text-xs">{result.id ?? '—'}</span>
              </Detail>
            </div>

            {/* Hashes */}
            <div className="border rounded-xl bg-card p-6 space-y-3">
              <h3 className="font-semibold">Checksums</h3>
              {hashRows.map((row) => {
                const value = (result[row.key] as string) || '';
                return (
                  <div key={row.key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{row.label}</span>
                      {value ? (
                        <button
                          onClick={() => copy(row.label, value)}
                          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                          aria-label={`Copy ${row.label}`}
                        >
                          {copied === row.label ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copied === row.label ? 'Copied' : 'Copy'}
                        </button>
                      ) : null}
                    </div>
                    <code className={`block text-xs break-all font-mono ${value ? '' : 'text-muted-foreground'}`}>
                      {value || '— not provided —'}
                    </code>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bulk Results */}
        {mode === 'bulk' && bulkResults && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Bulk results ({Object.keys(bulkResults).length} hashes)</h3>
              <Badge variant="secondary">{Object.values(bulkResults).filter(Boolean).length} found</Badge>
            </div>
            <div className="border rounded-xl bg-card divide-y max-h-[60vh] overflow-y-auto">
              {Object.entries(bulkResults).map(([hash, data]) => (
                <div key={hash} className="p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <code className="text-xs font-mono break-all block">{hash.slice(0, 32)}…{hash.slice(-8)}</code>
                    <code className="text-[10px] font-mono text-muted-foreground break-all">{hash}</code>
                    {data ? (
                      <div className="mt-1">
                        <Link
                          href={`/mod/${(data as any).project?.slug ?? ''}`}
                          className="text-sm font-medium hover:underline inline-flex items-center gap-1"
                        >
                          {(data as any).project?.title ?? (data as any).projectId ?? 'Project'}
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          v{(data as any).version} • {((data as any).loaders as string[])?.join(', ') || '—'} •{' '}
                          {typeof (data as any).fileSize === 'number' ? formatBytes((data as any).fileSize) : '—'}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground mt-1">No match for this hash</div>
                    )}
                  </div>
                  <div className="shrink-0">
                    {data ? (
                      <Badge variant="secondary" className="gap-1">
                        <PackageCheck className="h-3 w-3" /> Found
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <PackageX className="h-3 w-3" /> Missing
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="font-medium">{children}</div>
    </div>
  );
}

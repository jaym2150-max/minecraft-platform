import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@mcp/ui/components/button';
import {
  Code2, KeyRound, BookOpen, Download, Search, FileJson,
  Terminal, ArrowRight, ShieldCheck, Zap, Globe,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Public API — Build Launchers, Tools & Bots',
  description:
    'Free REST API for the Minecraft Platform catalog: search projects, fetch versions, resolve hashes and download files. API keys with scoped permissions.',
};

const ENDPOINTS = [
  { method: 'GET', path: '/api/v1/projects', desc: 'Search & filter projects (type, category, loader, game version, sort)' },
  { method: 'GET', path: '/api/v1/projects/:slug', desc: 'Full project detail incl. gallery, license, team' },
  { method: 'GET', path: '/api/v1/projects/:id/versions', desc: 'All versions with loaders + game versions' },
  { method: 'GET', path: '/api/v1/versions/:id/download', desc: 'Pre-signed download URL for a version file' },
  { method: 'POST', path: '/api/v1/version-files/bulk', desc: 'Resolve SHA-256 hashes → versions (launcher sync)' },
  { method: 'GET', path: '/api/v1/version-files/:hash', desc: 'Hash lookup (single file compatibility check)' },
  { method: 'GET', path: '/api/v1/projects/:slug/modpack/download', desc: '.mrpack archive — importable into Modrinth App / Prism' },
  { method: 'GET', path: '/api/v1/minecraft-versions', desc: 'Supported Minecraft versions' },
  { method: 'GET', path: '/api/v1/categories', desc: 'Browse categories' },
];

const METHOD_COLOR: Record<string, string> = {
  GET: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  POST: 'bg-sky-500/15 text-sky-500 border-sky-500/30',
};

export default function ApiDocsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b bg-muted/40">
          <div className="container py-12">
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black tracking-widest text-primary">
              <Code2 className="h-3.5 w-3.5" /> PUBLIC REST API
            </span>
            <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
              Build launchers, tools &amp; bots on top of our catalog
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              The same API that powers this site — free for launchers, mod managers, Discord bots and analytics tools.
              JSON over HTTP, cursor pagination, hash-based file resolution.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2 rounded-full">
                <Link href="/dashboard">
                  <KeyRound className="h-4 w-4" /> Get an API Key
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 rounded-full">
                <Link href="/docs">
                  <BookOpen className="h-4 w-4" /> Full Docs
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Quick start */}
        <section className="container grid gap-8 py-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-5">
            <h2 className="text-xl font-black tracking-tight">Getting started</h2>
            <ol className="space-y-4">
              {[
                { icon: KeyRound, t: '1. Create an account', d: 'Sign up and open your dashboard to generate an API key.' },
                { icon: ShieldCheck, t: '2. Scope your key', d: 'Pick read scopes (projects, versions) or write scopes for uploads.' },
                { icon: Terminal, t: '3. Call the API', d: 'Pass your key as Authorization: Bearer <key>. 60 req/min free tier.' },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.t} className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold">{s.t}</p>
                      <p className="text-sm text-muted-foreground">{s.d}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="rounded-xl border bg-card p-4">
              <p className="mb-2 flex items-center gap-2 text-xs font-black tracking-widest text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-primary" /> RATE LIMITS
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Anonymous: 60 req/min per IP</li>
                <li>• API key: 300 req/min</li>
                <li>• Headers: <code>x-ratelimit-limit / -remaining / -reset</code></li>
              </ul>
            </div>
          </div>

          {/* Code sample */}
          <div className="space-y-4">
            <h2 className="text-xl font-black tracking-tight">Quick example</h2>
            <div className="overflow-hidden rounded-xl border bg-zinc-950 text-zinc-100">
              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5">
                <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-zinc-400">
                  <Terminal className="h-3.5 w-3.5" /> CURL
                </span>
                <FileJson className="h-4 w-4 text-zinc-600" />
              </div>
              <pre className="overflow-x-auto p-4 text-xs leading-6"><code>{`# Search performance mods for MC 1.21
curl "http://localhost:4000/api/v1/projects?search=performance&gameVersions=1.21&limit=5"

# Fetch latest version's download URL
curl "http://localhost:4000/api/v1/projects/sodium/versions"

# Hash lookup (launcher instance sync)
curl -X POST http://localhost:4000/api/v1/version-files/bulk \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"hashes":["sha256:abc..."],"algorithm":"sha256"}'`}</code></pre>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { icon: Globe, k: 'JSON / REST' },
                { icon: ShieldCheck, k: 'Scoped keys' },
                { icon: Download, k: 'Pre-signed URLs' },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.k} className="rounded-lg border bg-card p-3">
                    <Icon className="mx-auto mb-1 h-4 w-4 text-primary" />
                    <p className="text-xs font-bold">{f.k}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Endpoint reference */}
        <section className="border-t bg-muted/40 py-10">
          <div className="container">
            <h2 className="mb-6 flex items-center gap-3 text-xl font-black tracking-tight">
              <Search className="h-5 w-5 text-primary" /> ENDPOINTS
            </h2>
            <div className="overflow-hidden rounded-xl border bg-card">
              {ENDPOINTS.map((e) => (
                <div key={e.path} className="flex flex-col gap-1 border-b p-4 last:border-b-0 sm:flex-row sm:items-center sm:gap-4">
                  <span className={`inline-flex w-fit shrink-0 items-center rounded-md border px-2 py-0.5 text-xs font-black ${METHOD_COLOR[e.method]}`}>
                    {e.method}
                  </span>
                  <code className="shrink-0 text-sm font-bold">{e.path}</code>
                  <span className="text-sm text-muted-foreground sm:ml-auto sm:text-right">{e.desc}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Download className="h-4 w-4" />
              Modpack exports are <code>.mrpack</code>-compatible — importable straight into the Modrinth App or Prism Launcher.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

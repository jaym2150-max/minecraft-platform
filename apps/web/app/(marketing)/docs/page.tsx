import Link from 'next/link';

export default function DocsPage() {
  return (
    <main className="flex-1">
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="container py-12">
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Everything you need to know about the Minecraft Platform.
          </p>
        </div>
      </section>
      <section className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold text-lg mb-2">Getting Started</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Learn how to browse, download, and install mods on our platform.
            </p>
            <Link href="/docs/getting-started" className="text-sm text-primary hover:underline">
              Read more →
            </Link>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold text-lg mb-2">Creating Projects</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Submit your own mods, modpacks, and plugins to share with the community.
            </p>
            <Link href="/docs/creating-projects" className="text-sm text-primary hover:underline">
              Read more →
            </Link>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold text-lg mb-2">API Reference</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Build integrations with our public REST API.
            </p>
            <Link href="/docs/api" className="text-sm text-primary hover:underline">
              Read more →
            </Link>
          </div>
          <div className="rounded-xl border bg-card p-6 border-emerald-500/20 bg-emerald-500/5">
            <h2 className="font-semibold text-lg mb-2">API Keys</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Self-serve keys with scopes, IP allowlist, and rate limits. No approval needed.
            </p>
            <a href="http://localhost:3002/api/keys" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
              Apply for API Key →
            </a>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold text-lg mb-2">SDK</h2>
            <p className="text-sm text-muted-foreground mb-4">
              TypeScript SDK with McpSDK + McpAdminSDK split. Install via pnpm add @mcp/sdk.
            </p>
            <a href="http://localhost:3002/sdk/installation" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
              View SDK →
            </a>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold text-lg mb-2">Full Docs</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Guides, teams, moderation, and full API reference on port 3002.
            </p>
            <a href="http://localhost:3002" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
              Open Docs →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

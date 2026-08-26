import Link from 'next/link';

export default function DocsPage() {
  return (
    <main className="flex-1">
      <section className="from-primary/5 to-background border-b bg-gradient-to-b">
        <div className="container py-12">
          <h1 className="mb-4 text-4xl font-bold">Documentation</h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Everything you need to know about the Minecraft Platform.
          </p>
        </div>
      </section>
      <section className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-card rounded-xl border p-6">
            <h2 className="mb-2 text-lg font-semibold">Getting Started</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Learn how to browse, download, and install mods on our platform.
            </p>
            <Link href="/docs/getting-started" className="text-primary text-sm hover:underline">
              Read more →
            </Link>
          </div>
          <div className="bg-card rounded-xl border p-6">
            <h2 className="mb-2 text-lg font-semibold">Creating Projects</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Submit your own mods, modpacks, and plugins to share with the community.
            </p>
            <Link href="/docs/creating-projects" className="text-primary text-sm hover:underline">
              Read more →
            </Link>
          </div>
          <div className="bg-card rounded-xl border p-6">
            <h2 className="mb-2 text-lg font-semibold">API Reference</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Build integrations with our public REST API.
            </p>
            <Link href="/docs/api" className="text-primary text-sm hover:underline">
              Read more →
            </Link>
          </div>
          <div className="bg-card rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6">
            <h2 className="mb-2 text-lg font-semibold">API Keys</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Self-serve keys with scopes, IP allowlist, and rate limits. No approval needed.
            </p>
            <a
              href="http://localhost:3002/api/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm hover:underline"
            >
              Apply for API Key →
            </a>
          </div>
          <div className="bg-card rounded-xl border p-6">
            <h2 className="mb-2 text-lg font-semibold">SDK</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              TypeScript SDK with McpSDK + McpAdminSDK split. Install via pnpm add @mcp/sdk.
            </p>
            <a
              href="http://localhost:3002/sdk/installation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm hover:underline"
            >
              View SDK →
            </a>
          </div>
          <div className="bg-card rounded-xl border p-6">
            <h2 className="mb-2 text-lg font-semibold">Full Docs</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Guides, teams, moderation, and full API reference on port 3002.
            </p>
            <a
              href="http://localhost:3002"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm hover:underline"
            >
              Open Docs →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

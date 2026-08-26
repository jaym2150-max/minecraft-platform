import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { Book, Code2, Github } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: { default: 'Documentation', template: '%s | MCP Docs' },
  description: 'Minecraft Platform documentation - guides, API reference, and tutorials',
};

const NAV = [
  {
    title: 'Getting Started',
    items: [
      { href: '/', label: 'Introduction' },
      { href: '/quickstart', label: 'Quickstart' },
      { href: '/installation', label: 'Installation' },
    ],
  },
  {
    title: 'Guides',
    items: [
      { href: '/guides/uploading', label: 'Uploading Projects' },
      { href: '/guides/teams', label: 'Managing Teams' },
      { href: '/guides/moderation', label: 'Content Moderation' },
    ],
  },
  {
    title: 'API Reference',
    items: [
      { href: '/api/auth', label: 'Authentication' },
      { href: '/api/keys', label: 'API Keys' },
      { href: '/api/projects', label: 'Projects' },
      { href: '/api/versions', label: 'Versions' },
      { href: '/api/search', label: 'Search' },
    ],
  },
  {
    title: 'SDK',
    items: [
      { href: '/sdk/installation', label: 'Installation' },
      { href: '/sdk/usage', label: 'Usage' },
    ],
  },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans antialiased`}>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <Link href="/" className="flex items-center gap-2 text-lg font-bold">
                <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                  <Book className="h-4 w-4 text-white" />
                </div>
                <span>MCP Docs</span>
              </Link>
              <nav className="flex items-center gap-6 text-sm">
                <Link href="/" className="hover:text-primary">
                  Docs
                </Link>
                <a href="https://github.com" className="hover:text-primary flex items-center gap-1">
                  <Github className="h-4 w-4" /> GitHub
                </a>
              </nav>
            </div>
          </header>

          <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[240px_1fr]">
            <aside className="hidden lg:block">
              <nav className="sticky top-24 space-y-6">
                {NAV.map((section) => (
                  <div key={section.title}>
                    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {section.title}
                    </h2>
                    <ul className="space-y-1">
                      {section.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="hover:text-primary block rounded px-2 py-1 text-sm text-slate-700"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </aside>

            <main className="prose max-w-none">{children}</main>
          </div>

          <footer className="mt-12 border-t py-8">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 text-sm text-slate-600">
              <p>&copy; {new Date().getFullYear()} Minecraft Platform. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link href="/" className="hover:text-primary">
                  Docs
                </Link>
                <a href="https://github.com" className="hover:text-primary">
                  GitHub
                </a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

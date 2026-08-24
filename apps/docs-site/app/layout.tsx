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
        <div className="min-h-screen flex flex-col">
          <header className="border-b sticky top-0 bg-white/95 backdrop-blur z-10">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Book className="h-4 w-4 text-white" />
                </div>
                <span>MCP Docs</span>
              </Link>
              <nav className="flex items-center gap-6 text-sm">
                <Link href="/" className="hover:text-primary">Docs</Link>
                <a href="https://github.com" className="flex items-center gap-1 hover:text-primary">
                  <Github className="h-4 w-4" /> GitHub
                </a>
              </nav>
            </div>
          </header>

          <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
            <aside className="hidden lg:block">
              <nav className="space-y-6 sticky top-24">
                {NAV.map((section) => (
                  <div key={section.title}>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      {section.title}
                    </h2>
                    <ul className="space-y-1">
                      {section.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="block text-sm text-slate-700 hover:text-primary px-2 py-1 rounded"
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

          <footer className="border-t py-8 mt-12">
            <div className="max-w-7xl mx-auto px-6 text-sm text-slate-600 flex items-center justify-between">
              <p>&copy; {new Date().getFullYear()} Minecraft Platform. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link href="/" className="hover:text-primary">Docs</Link>
                <a href="https://github.com" className="hover:text-primary">GitHub</a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

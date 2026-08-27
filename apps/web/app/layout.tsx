import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';
import { PwaRegister } from '@/components/pwa-register';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Minecraft Platform — Discover, Download & Share Minecraft Mods',
    template: '%s | Minecraft Platform',
  },
  description:
    'The home for Minecraft mods, modpacks and plugins. One search, every loader (Fabric, Forge, NeoForge, Quilt), every version. Malware-scanned downloads, creator payouts, and a community of thousands.',
  keywords: [
    'minecraft mods',
    'modpacks',
    'minecraft plugins',
    'fabric mods',
    'forge mods',
    'neoforge',
    'quilt',
    'minecraft 1.21 mods',
    'mod downloader',
    'sodium',
    'create mod',
    'jei',
  ],
  authors: [{ name: 'Minecraft Platform' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Minecraft Platform',
    title: 'Minecraft Platform — Find Your Next Mod',
    description:
      'Thousands of malware-scanned Minecraft mods, modpacks and plugins. Every loader, every version, one search.',
    images: [{ url: '/og', width: 1200, height: 630, alt: 'Minecraft Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Minecraft Platform — Find Your Next Mod',
    description:
      'Thousands of malware-scanned Minecraft mods. Every loader, every version, one search.',
    images: ['/og'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  applicationName: 'Minecraft Platform',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Minecraft Platform',
  },
  formatDetection: { telephone: false, address: false, email: false },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: ['/icon.svg'],
    apple: [
      { url: '/icon-maskable.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  manifest: '/manifest.webmanifest',
  other: {
    'theme-color': '#ff6a1a',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // JSON-LD structured data — SoftwareApplication/WebSite for rich Google results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Minecraft Platform',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/mods?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icon-maskable.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#ff6a1a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Minecraft Platform" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main-content"
          className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2 focus:shadow-lg"
        >
          Skip to content
        </a>
        <Providers>
          <PwaRegister />
          {children}
        </Providers>
      </body>
    </html>
  );
}

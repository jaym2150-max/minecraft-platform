import type { Metadata } from 'next';
import ModpackBuilderClient from './builder-client';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';

export const metadata: Metadata = {
  title: 'Modpack Builder — Create a Custom Minecraft Modpack',
  description:
    'Pick your Minecraft version and loader, add mods, resolve dependencies and export a .mrpack.',
  alternates: { canonical: `${siteUrl}/modpacks/new` },
  openGraph: {
    type: 'website',
    title: 'Modpack Builder',
    description: 'Create a custom modpack with dependency resolution and compatibility scoring.',
    url: `${siteUrl}/modpacks/new`,
  },
};

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Modpack Builder',
    description: 'Create a custom Minecraft modpack.',
    url: `${siteUrl}/modpacks/new`,
    isPartOf: { '@type': 'WebSite', name: 'Minecraft Platform', url: siteUrl },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ModpackBuilderClient />
    </>
  );
}

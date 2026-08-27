import type { Metadata } from 'next';
import ModpackImportClient from './import-client';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';

export const metadata: Metadata = {
  title: 'Import a Modpack — Minecraft Platform',
  description:
    'Paste a Modrinth .mrpack manifest (modrinth.index.json) and validate the file composition, loader, and Minecraft version before publishing.',
  alternates: { canonical: `${siteUrl}/modpacks/import` },
  openGraph: {
    type: 'website',
    title: 'Import a Modpack',
    description: 'Validate a Modrinth modpack manifest and see which files link to the catalog.',
    url: `${siteUrl}/modpacks/import`,
  },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <ModpackImportClient />;
}

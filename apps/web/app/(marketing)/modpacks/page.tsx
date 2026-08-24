import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { TypeLandingPage } from '@/components/type-landing';
import { BrowsePageContent } from '../mods/page';

export const metadata: Metadata = {
  title: 'Minecraft Modpacks — Curated Mod Collections for Every Playstyle',
  description: 'Browse hundreds of Minecraft modpacks: tech, magic, exploration, hardcore and more. One-click installs with automatic dependency resolution.',
};

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Suspense fallback={null}>
        <TypeLandingPage type="MODPACK" />
        <BrowsePageContent />
      </Suspense>
      <Footer />
    </div>
  );
}

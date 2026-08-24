import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { TypeLandingPage } from '@/components/type-landing';
import { BrowsePageContent } from '../mods/browse-content';

export const metadata: Metadata = {
  title: 'Minecraft Server Plugins — Bukkit, Spigot & Paper',
  description: 'Essential server plugins for Bukkit, Spigot and Paper: moderation, economy, minigames, world protection and more.',
};

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Suspense fallback={null}>
        <TypeLandingPage type="PLUGIN" />
        <BrowsePageContent />
      </Suspense>
      <Footer />
    </div>
  );
}

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { TypeLandingRedirect } from '@/components/type-landing';

export const metadata: Metadata = {
  title: 'Minecraft Modpacks — Curated Mod Collections for Every Playstyle',
  description: 'Browse hundreds of Minecraft modpacks: tech, magic, exploration, hardcore and more. One-click installs with automatic dependency resolution.',
};

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Suspense fallback={null}>
        <TypeLandingRedirect type="MODPACK" />
      </Suspense>
      <Footer />
    </div>
  );
}

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { TypeLandingRedirect } from '@/components/type-landing';

export const metadata: Metadata = {
  title: 'Minecraft Shaders — Beautiful Visuals & Ray Tracing Packs',
  description: 'Transform Minecraft with shaders: realistic lighting, water reflections, volumetric clouds. Compatible with Iris, OptiFine and Sodium.',
};

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Suspense fallback={null}>
        <TypeLandingRedirect type="SHADER" />
      </Suspense>
      <Footer />
    </div>
  );
}

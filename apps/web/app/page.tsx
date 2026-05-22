'use client';

import Link from 'next/link';
import { ArrowRight, Download, Search, Shield, Users } from 'lucide-react';
import { Button } from '@mcp/ui/components/button';

const features = [
  {
    icon: Search,
    title: 'Discover Mods',
    description: 'Browse thousands of Minecraft mods, modpacks, and plugins with powerful search.',
  },
  {
    icon: Download,
    title: 'Easy Downloads',
    description: 'One-click downloads with automatic dependency resolution and version management.',
  },
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'Every file is scanned for malware and verified by our community.',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Join a thriving community of modders and players.',
  },
];

const trendingMods = [
  {
    title: 'Sodium',
    author: 'CaffeineMC',
    downloads: '12.5M',
    category: 'Performance',
  },
  {
    title: 'Create',
    author: 'Simibubi',
    downloads: '8.2M',
    category: 'Technology',
  },
  {
    title: 'JEI',
    author: 'mezz',
    downloads: '15.1M',
    category: 'Utility',
  },
  {
    title: 'Iris Shaders',
    author: 'IrisShaders',
    downloads: '6.8M',
    category: 'Graphics',
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">MP</span>
            </div>
            Minecraft Platform
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/mods" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Browse Mods
            </Link>
            <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Button asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            The Ultimate{' '}
            <span className="text-primary">Minecraft Mod</span>{' '}
            Platform
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            Discover, download, and share Minecraft mods, modpacks, and plugins.
            Built for modders, by modders.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/mods">
                Browse Mods
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/50 py-24">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="container py-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Trending Mods</h2>
          <Button variant="ghost" asChild>
            <Link href="/mods">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingMods.map((mod) => (
            <Link
              key={mod.title}
              href={`/mods/${mod.title.toLowerCase()}`}
              className="group rounded-xl border bg-card p-6 hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl font-bold text-primary">{mod.title[0]}</span>
              </div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {mod.title}
              </h3>
              <p className="text-sm text-muted-foreground">by {mod.author}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                  {mod.category}
                </span>
                <span className="text-xs text-muted-foreground">{mod.downloads} downloads</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/mods" className="hover:text-foreground transition-colors">Browse Mods</Link></li>
                <li><Link href="/mods" className="hover:text-foreground transition-colors">Modpacks</Link></li>
                <li><Link href="/mods" className="hover:text-foreground transition-colors">Plugins</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="hover:text-foreground transition-colors cursor-pointer">Discord</span></li>
                <li><span className="hover:text-foreground transition-colors cursor-pointer">GitHub</span></li>
                <li><span className="hover:text-foreground transition-colors cursor-pointer">Forums</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="hover:text-foreground transition-colors cursor-pointer">Documentation</span></li>
                <li><span className="hover:text-foreground transition-colors cursor-pointer">API</span></li>
                <li><span className="hover:text-foreground transition-colors cursor-pointer">FAQ</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="hover:text-foreground transition-colors cursor-pointer">Terms of Service</span></li>
                <li><span className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-foreground transition-colors cursor-pointer">DMCA</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Minecraft Platform. Not affiliated with Mojang Studios.
          </div>
        </div>
      </footer>
    </div>
  );
}

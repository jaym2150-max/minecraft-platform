'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Download, Heart } from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { Input } from '@mcp/ui/components/input';

const categories = ['All', 'Performance', 'Technology', 'Utility', 'Graphics', 'Magic', 'Adventure', 'Storage'];
const loaders = ['All', 'Fabric', 'Forge', 'NeoForge', 'Quilt', 'Bukkit', 'Spigot', 'Paper'];

const mods = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: ['Sodium', 'Create', 'JEI', 'Iris Shaders', 'Lithium', 'Phosphor', 'REI', 'AppleSkin'][i % 8],
  author: ['CaffeineMC', 'Simibubi', 'mezz', 'IrisShaders', 'CaffeineMC', 'CaffeineMC', 'shedaniel', 'squeek502'][i % 8],
  description: 'A Minecraft mod that enhances performance, adds new features, or improves the gameplay experience.',
  downloads: `${(Math.random() * 15 + 0.1).toFixed(1)}M`,
  likes: Math.floor(Math.random() * 10000),
  category: categories[Math.floor(Math.random() * (categories.length - 1)) + 1],
  loader: loaders[Math.floor(Math.random() * (loaders.length - 1)) + 1],
  updated: `${Math.floor(Math.random() * 30) + 1}d ago`,
}));

export default function ModsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLoader, setSelectedLoader] = useState('All');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">MP</span>
            </div>
            Minecraft Platform
          </Link>
        </div>
      </header>

      <div className="container py-8">
        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mods..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {loaders.map((loader) => (
              <Button
                key={loader}
                variant={selectedLoader === loader ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedLoader(loader)}
              >
                {loader}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mods.map((mod) => (
            <Link
              key={mod.id}
              href={`/mod/${mod.title.toLowerCase()}`}
              className="group rounded-xl border bg-card p-5 hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xl font-bold text-primary">{mod.title[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">by {mod.author}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                {mod.description}
              </p>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                  {mod.category}
                </span>
                <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                  {mod.loader}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Download className="h-3.5 w-3.5" />
                  {mod.downloads}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  {mod.likes.toLocaleString()}
                </span>
                <span>Updated {mod.updated}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

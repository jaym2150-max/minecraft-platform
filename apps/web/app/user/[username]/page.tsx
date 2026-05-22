'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Download, Heart, Calendar, Globe, Github, MessageSquare } from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { Avatar, AvatarFallback } from '@mcp/ui/components/avatar';

const userMods = Array.from({ length: 6 }, (_, i) => ({
  title: ['Sodium', 'Lithium', 'Phosphor', 'Hydrogen', 'DashLoader', 'SmoothBoot'][i],
  downloads: `${(Math.random() * 10 + 0.5).toFixed(1)}M`,
  category: ['Performance', 'Performance', 'Performance', 'Performance', 'Utility', 'Utility'][i],
}));

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;

  return (
    <div className="min-h-screen">
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
        {/* Profile Header */}
        <div className="rounded-xl border bg-card p-8 mb-8">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                {username?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{username}</h1>
              <p className="text-muted-foreground mt-1">Mod Developer &amp; Minecraft Enthusiast</p>
              <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Joined Jan 2024
                </span>
                <span className="flex items-center gap-1.5">
                  <Download className="h-4 w-4" />
                  45.2M total downloads
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="h-4 w-4" />
                  12.8K total favorites
                </span>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <Globe className="h-4 w-4 mr-1" />
                  Website
                </Button>
                <Button variant="outline" size="sm">
                  <Github className="h-4 w-4 mr-1" />
                  GitHub
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Message
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mods Grid */}
        <h2 className="text-2xl font-bold mb-6">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userMods.map((mod) => (
            <Link
              key={mod.title}
              href={`/mod/${mod.title.toLowerCase()}`}
              className="rounded-xl border bg-card p-5 hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">{mod.title[0]}</span>
                </div>
                <div>
                  <h3 className="font-semibold">{mod.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {mod.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Download className="h-3.5 w-3.5 mr-1" />
                {mod.downloads} downloads
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

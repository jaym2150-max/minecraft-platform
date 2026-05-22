'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Download, Heart, Shield, Share2, ChevronDown, ChevronUp, Clock, User, Tag, Package } from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { Badge } from '@mcp/ui/components/badge';

const versions = [
  { version: '1.21.1', loader: 'Fabric', updated: '2d ago', downloads: '52K', status: 'approved' },
  { version: '1.21', loader: 'Fabric', updated: '1w ago', downloads: '128K', status: 'approved' },
  { version: '1.20.6', loader: 'Fabric', updated: '3w ago', downloads: '89K', status: 'approved' },
  { version: '1.20.4', loader: 'Forge', updated: '1m ago', downloads: '45K', status: 'approved' },
];

export default function ModDetailPage() {
  const params = useParams();
  const [showAllVersions, setShowAllVersions] = useState(false);
  const slug = params.slug as string;

  const displayedVersions = showAllVersions ? versions : versions.slice(0, 2);

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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4 mr-1" />
              Favorite
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Meta */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-3xl font-bold text-primary">{slug?.[0]?.toUpperCase() || '?'}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold capitalize">{slug}</h1>
                  <p className="text-muted-foreground mt-1">by <span className="text-foreground font-medium">AuthorName</span></p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      12.5M downloads
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      24.3K favorites
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Updated 2 days ago
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  This is a comprehensive Minecraft mod that enhances the gameplay experience with 
                  new features, optimizations, and content. It is designed to be lightweight, 
                  compatible with other mods, and highly configurable.
                </p>
                <h3>Features</h3>
                <ul>
                  <li>Lightweight and performant</li>
                  <li>Highly configurable through config files</li>
                  <li>Compatible with most other mods</li>
                  <li>Regular updates with new content</li>
                  <li>Active community support</li>
                </ul>
              </div>
            </div>

            {/* Versions */}
            <div className="rounded-xl border bg-card">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Versions</h2>
              </div>
              <div className="divide-y">
                {displayedVersions.map((v, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="font-medium">MC {v.version}</span>
                        <span className="ml-2 text-sm text-muted-foreground">- {v.loader}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        {v.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{v.downloads} downloads</span>
                      <span>{v.updated}</span>
                      <Button size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {versions.length > 2 && (
                <div className="p-3 text-center border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllVersions(!showAllVersions)}
                  >
                    {showAllVersions ? (
                      <>Show Less <ChevronUp className="ml-1 h-4 w-4" /></>
                    ) : (
                      <>Show All Versions ({versions.length}) <ChevronDown className="ml-1 h-4 w-4" /></>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Download Card */}
            <div className="rounded-xl border bg-card p-6">
              <Button className="w-full mb-3" size="lg">
                <Download className="h-5 w-5 mr-2" />
                Download Latest
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Version 1.21.1 - Fabric
              </p>
            </div>

            {/* Info Card */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <h3 className="font-semibold">Mod Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Category:</span>
                  <span>Performance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Loaders:</span>
                  <span>Fabric, Forge</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Author:</span>
                  <span>AuthorName</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Updated:</span>
                  <span>2 days ago</span>
                </div>
              </div>
            </div>

            {/* Dependencies */}
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-3">Dependencies</h3>
              <div className="space-y-2 text-sm">
                {['Fabric API', 'Cloth Config API'].map((dep) => (
                  <div key={dep} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <span>{dep}</span>
                    <Badge variant="outline" className="text-xs">Required</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

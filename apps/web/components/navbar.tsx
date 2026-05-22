'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@mcp/ui/components/button';
import { SearchBar } from './search-bar';
import { ThemeToggle } from './theme-toggle';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">MP</span>
            </div>
            <span className="hidden sm:inline">Minecraft Platform</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/mods" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Browse
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4 flex-1 max-w-sm">
          <SearchBar />
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/register">Get Started</Link>
          </Button>
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t p-4 space-y-4">
          <SearchBar />
          <nav className="flex flex-col gap-2">
            <Link href="/mods" className="text-sm font-medium py-2">Browse Mods</Link>
            <Link href="/dashboard" className="text-sm font-medium py-2">Dashboard</Link>
            <Link href="/auth/login" className="text-sm font-medium py-2">Sign In</Link>
            <Button asChild className="w-full">
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}

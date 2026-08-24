'use client';

import Link from 'next/link';
import { Menu, X, User, LogOut, Settings, Package, LayoutDashboard } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@mcp/ui/components/button';
import { Avatar, AvatarFallback } from '@mcp/ui/components/avatar';
import { SearchAutocomplete } from './search-autocomplete';
import { ThemeToggle } from './theme-toggle';
import { useAuth } from '@mcp/auth';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? '?';

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
            <Link href="/collections" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Collections
            </Link>
            <Link href="/lookup" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Lookup
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4 flex-1 max-w-sm">
          <SearchAutocomplete className="w-full" placeholder="Search mods..." />
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {/* H-F7 (AUDIT.md): during the AuthProvider's first /auth/me verify
              isAuthenticated is false and user is null, so without this gate
              we would briefly render the Sign In / Get Started buttons before
              swapping to the authenticated avatar dropdown — a visible flash.
              Reserve the same width with a neutral skeleton so the layout
              does not jump when the real chrome appears. */}
          {authLoading ? (
            <div
              className="h-9 w-32 rounded-lg bg-muted animate-pulse"
              data-testid="navbar-auth-loading"
              aria-hidden="true"
            />
          ) : isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium max-w-[120px] truncate">{user.username}</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-popover p-1 shadow-lg z-50">
                  <div className="px-3 py-2 border-b mb-1">
                    <p className="text-sm font-medium truncate">{user.username}</p>
                    {/* C23 (AUDIT.md): the email is server-supplied PII that
                        a shoulder-surfer / DOM inspector could read off the
                        rendered node. The settings page already shows the
                        full profile so the navbar's "signed-in-as" hint can
                        omit the email entirely. If a future design needs a
                        contact hint, prefer a truncated / masked form
                        rendered only on explicit user opt-in. */}
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors w-full"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors w-full"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                  <button
                    onClick={() => { setProfileOpen(false); logout(); }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors w-full text-destructive"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </>
          )}
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
          <SearchAutocomplete className="w-full" placeholder="Search mods..." />
          <nav className="flex flex-col gap-2">
            <Link href="/mods" className="text-sm font-medium py-2">Browse Mods</Link>
            <Link href="/collections" className="text-sm font-medium py-2">Collections</Link>
            <Link href="/lookup" className="text-sm font-medium py-2">Hash Lookup</Link>
            <Link href="/dashboard" className="text-sm font-medium py-2">Dashboard</Link>
            {authLoading ? null : isAuthenticated && user ? (
              <>
                <Link href="/settings" className="text-sm font-medium py-2">Settings</Link>
                <Button variant="ghost" className="w-full justify-start text-destructive" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium py-2">Sign In</Link>
                <Button asChild className="w-full">
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

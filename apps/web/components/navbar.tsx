'use client';

import Link from 'next/link';
import { Menu, X, User, LogOut, Settings, Package, LayoutDashboard } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@mcp/ui/components/button';
import { Avatar, AvatarFallback } from '@mcp/ui/components/avatar';
import { SearchAutocomplete } from './search-autocomplete';
import { ThemeToggle } from './theme-toggle';
import { NotificationBell } from './notification-bell';
import { LocaleSwitcher } from './locale-switcher';
import { useAuth } from '@mcp/auth';
import { useI18n } from '@/i18n/provider';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { t } = useI18n();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setProfileOpen(false);
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? '?';

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <span className="text-primary-foreground text-sm font-bold">MP</span>
            </div>
            <span className="hidden sm:inline">{t('common.appName')}</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/mods"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {t('common.browse')}
            </Link>
            <Link
              href="/collections"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {t('common.collections')}
            </Link>
            <Link
              href="/lookup"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {t('common.lookup')}
            </Link>
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {t('common.dashboard')}
            </Link>
          </nav>
        </div>

        <div className="hidden max-w-sm flex-1 items-center gap-4 md:flex">
          <SearchAutocomplete className="w-full" placeholder={t('common.search')} />
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <LocaleSwitcher />
          <NotificationBell />
          {/* H-F7 (AUDIT.md): during the AuthProvider's first /auth/me verify
              isAuthenticated is false and user is null, so without this gate
              we would briefly render the Sign In / Get Started buttons before
              swapping to the authenticated avatar dropdown — a visible flash.
              Reserve the same width with a neutral skeleton so the layout
              does not jump when the real chrome appears. */}
          {authLoading ? (
            <div
              className="bg-muted h-9 w-32 animate-pulse rounded-lg"
              data-testid="navbar-auth-loading"
              aria-hidden="true"
            />
          ) : isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                aria-controls="navbar-profile-menu"
                aria-label={`${t('common.openAccountMenu')}: ${user.username}`}
                className="hover:bg-muted flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-[120px] truncate text-sm font-medium">{user.username}</span>
              </button>
              {profileOpen && (
                <div
                  id="navbar-profile-menu"
                  role="menu"
                  aria-label="Account"
                  className="bg-popover absolute right-0 z-50 mt-2 w-56 rounded-xl border p-1 shadow-lg"
                >
                  <div className="mb-1 border-b px-3 py-2">
                    <p className="truncate text-sm font-medium">{user.username}</p>
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
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                    className="hover:bg-muted flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" /> {t('common.dashboard')}
                  </Link>
                  <Link
                    href="/settings"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                    className="hover:bg-muted flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                  >
                    <Settings className="h-4 w-4" /> {t('common.settings')}
                  </Link>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="hover:bg-muted text-destructive flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> {t('common.signOut')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">{t('common.signIn')}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">{t('common.getStarted')}</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="p-2 md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          aria-controls="navbar-mobile-menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div id="navbar-mobile-menu" className="space-y-4 border-t p-4 md:hidden">
          <SearchAutocomplete className="w-full" placeholder={t('common.search')} />
          <nav className="flex flex-col gap-2">
            <Link
              href="/mods"
              onClick={() => setIsOpen(false)}
              className="py-2 text-sm font-medium"
            >
              {t('common.browse')}
            </Link>
            <Link
              href="/collections"
              onClick={() => setIsOpen(false)}
              className="py-2 text-sm font-medium"
            >
              {t('common.collections')}
            </Link>
            <Link
              href="/lookup"
              onClick={() => setIsOpen(false)}
              className="py-2 text-sm font-medium"
            >
              {t('common.lookup')}
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="py-2 text-sm font-medium"
            >
              {t('common.dashboard')}
            </Link>
            {authLoading ? null : isAuthenticated && user ? (
              <>
                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="py-2 text-sm font-medium"
                >
                  {t('common.settings')}
                </Link>
                <Button
                  variant="ghost"
                  className="text-destructive w-full justify-start"
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> {t('common.signOut')}
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="py-2 text-sm font-medium"
                >
                  {t('common.signIn')}
                </Link>
                <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
                  <Link href="/auth/register">{t('common.getStarted')}</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

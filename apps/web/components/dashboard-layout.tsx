'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  Package,
  Upload,
  CreditCard,
  ChevronRight,
  Settings,
  LifeBuoy,
  Shield,
  Loader2,
} from 'lucide-react';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { useAuth } from '@mcp/auth';

const sidebarLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/projects', label: 'Projects', icon: Package },
  { href: '/dashboard/uploads', label: 'Uploads', icon: Upload },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
];

// The web app's /admin route is a single tabbed page, so the sidebar shows
// one entry instead of five fake deep-links that all pointed at /admin.
const adminSidebarLinks = [{ href: '/admin', label: 'Admin Panel', icon: BarChart3 }];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading: authLoading } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');
  const links = isAdminPage ? adminSidebarLinks : sidebarLinks;

  // H-F7 (AUDIT.md): on hard navigation the AuthProvider runs its first
  // /auth/me verify on mount, during which isAuthenticated is false and user
  // is null. Without this gate the dashboard briefly renders the public
  // sidebar (no admin link for admins) and pages inside (e.g. billing) can
  // see the redirect-to-login effect fire before the cookie check resolves.
  // Render a neutral skeleton so the layout height is reserved and there
  // is no flash of unauthenticated chrome. The per-page auth guards in
  // admin/page.tsx + settings/page.tsx continue to run after we re-render.
  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center" data-testid="auth-loading">
          <div className="text-muted-foreground flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p>Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  function linkClass(isActive: boolean) {
    return (
      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ' +
      (isActive
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted')
    );
  }

  function mobileLinkClass(isActive: boolean) {
    return (
      'flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 shrink-0 whitespace-nowrap transition-colors ' +
      (isActive
        ? 'border-primary text-foreground'
        : 'border-transparent text-muted-foreground hover:text-foreground')
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="bg-card hidden w-64 shrink-0 flex-col border-r lg:flex">
          <nav className="flex-1 space-y-1 p-4">
            <p className="text-muted-foreground px-3 pb-2 text-xs font-medium uppercase tracking-wider">
              {isAdminPage ? 'Admin' : 'Dashboard'}
            </p>
            {links.map((link) => {
              const isActive = isAdminPage
                ? pathname === '/admin' && link.label === 'Overview'
                : pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className={linkClass(isActive)}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                  {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />}
                </Link>
              );
            })}
            {!isAdminPage && isAdmin && (
              <>
                <div className="pb-2 pt-4">
                  <p className="text-muted-foreground px-3 text-xs font-medium uppercase tracking-wider">
                    Admin
                  </p>
                </div>
                <Link href="/admin" className={linkClass(pathname === '/admin')}>
                  <Shield className="h-4 w-4" />
                  Admin Panel
                  {pathname === '/admin' && (
                    <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
                  )}
                </Link>
              </>
            )}
          </nav>
          <div className="space-y-1 border-t p-4">
            <Link
              href="/settings"
              className="text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <Link
              href="/faq"
              className="text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
            >
              <LifeBuoy className="h-4 w-4" />
              Help &amp; FAQ
            </Link>
          </div>
        </aside>

        {/* Content column — mobile tabs above a single content region so
            children (and the skip-link target) are rendered once, not
            duplicated per breakpoint. */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="w-full lg:hidden">
            <nav className="bg-card sticky top-16 z-40 flex overflow-x-auto border-b">
              {links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    className={mobileLinkClass(isActive)}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                );
              })}
              {!isAdminPage && isAdmin && (
                <Link href="/admin" className={mobileLinkClass(pathname === '/admin')}>
                  <Shield className="h-3.5 w-3.5" />
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <main id="main-content" className="bg-muted/30 flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

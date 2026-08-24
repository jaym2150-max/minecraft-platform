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
  Users,
  Flag,
  TrendingUp,
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

const adminSidebarLinks = [
  { href: '/admin', label: 'Overview', icon: BarChart3 },
  { href: '/admin', label: 'Projects', icon: Package },
  { href: '/admin', label: 'Users', icon: Users },
  { href: '/admin', label: 'Reports', icon: Flag },
  { href: '/admin', label: 'Analytics', icon: TrendingUp },
];

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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center" data-testid="auth-loading">
          <div className="flex items-center gap-3 text-muted-foreground">
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r bg-card shrink-0">
          <nav className="flex-1 p-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 pb-2">
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
                  {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-60" />}
                </Link>
              );
            })}
            {!isAdminPage && isAdmin && (
              <>
                <div className="pt-4 pb-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3">
                    Admin
                  </p>
                </div>
                <Link
                  href="/admin"
                  className={linkClass(pathname === '/admin')}
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                  {pathname === '/admin' && <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-60" />}
                </Link>
              </>
            )}
          </nav>
          <div className="p-4 border-t space-y-1">
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <LifeBuoy className="h-4 w-4" />
              Support
            </Link>
          </div>
        </aside>

        {/* Mobile tabs */}
        <div className="lg:hidden w-full">
          <nav className="flex border-b bg-card sticky top-16 z-40 overflow-x-auto">
            {links.map((link) => {
              const isActive = isAdminPage
                ? pathname === '/admin' && link.label === 'Overview'
                : pathname === link.href;
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
              <Link
                href="/admin"
                className={mobileLinkClass(pathname === '/admin')}
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
          </nav>
          <div className="bg-muted/30">{children}</div>
        </div>

        {/* Desktop content */}
        <main className="hidden lg:block flex-1 bg-muted/30 overflow-auto">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}

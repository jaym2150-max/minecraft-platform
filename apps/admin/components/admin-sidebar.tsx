'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Flag,
  ShieldAlert,
  Users,
  FolderKanban,
  BarChart3,
  LogOut,
  Settings,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/reports', label: 'Reports', icon: Flag },
  { href: '/malware', label: 'Malware Scans', icon: ShieldAlert },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 border-r bg-white min-h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <ShieldAlert className="h-4 w-4 text-white" />
          </div>
          <span>Admin</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" />
          Exit Admin
        </Link>
      </div>
    </aside>
  );
}

'use client';

import { Bell, Search } from 'lucide-react';

export function AdminHeader() {
  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search users, projects, reports..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg hover:bg-slate-100">
            <Bell className="h-5 w-5 text-slate-700" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-medium">
            A
          </div>
        </div>
      </div>
    </header>
  );
}

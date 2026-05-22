import { create } from 'zustand';
import type { Project } from '@mcp/types';

interface AppState {
  // UI State
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Projects cache
  recentProjects: Project[];
  setRecentProjects: (projects: Project[]) => void;

  // Notifications
  notifications: number;
  setNotifications: (count: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // UI State
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Projects
  recentProjects: [],
  setRecentProjects: (projects) => set({ recentProjects: projects }),

  // Notifications
  notifications: 0,
  setNotifications: (count) => set({ notifications: count }),
}));

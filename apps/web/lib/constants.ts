export const APP_NAME = 'Minecraft Platform';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const ROUTES = {
  HOME: '/',
  MODS: '/mods',
  MOD_DETAIL: (slug: string) => `/mods/${slug}`,
  USER: (username: string) => `/user/${username}`,
  DASHBOARD: '/dashboard',
  DASHBOARD_PROJECTS: '/dashboard/projects',
  DASHBOARD_UPLOADS: '/dashboard/uploads',
  DASHBOARD_ANALYTICS: '/dashboard/analytics',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  SETTINGS: '/settings',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const FILE_LIMITS = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_TYPES: ['.jar', '.zip', '.json'],
} as const;

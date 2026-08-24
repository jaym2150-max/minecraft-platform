export enum ApiKeyScope {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  USER_READ = 'USER_READ',
  USER_WRITE = 'USER_WRITE',
  PROJECT_READ = 'PROJECT_READ',
  PROJECT_WRITE = 'PROJECT_WRITE',
  VERSION_READ = 'VERSION_READ',
  VERSION_WRITE = 'VERSION_WRITE',
  ANALYTICS_READ = 'ANALYTICS_READ',
  ADMIN = 'ADMIN',
}

export interface ApiKeyInfo {
  id: string;
  name: string;
  scopes: ApiKeyScope[];
  ipAllowlist: string[];
  lastUsedAt?: string;
  expiresAt?: string;
  revokedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKeyWithSecret extends ApiKeyInfo {
  secret: string;
}

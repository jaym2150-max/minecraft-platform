export enum ProjectStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  REJECTED = 'REJECTED',
}

export enum ProjectType {
  MOD = 'MOD',
  MODPACK = 'MODPACK',
  RESOURCE_PACK = 'RESOURCE_PACK',
  SHADER = 'SHADER',
  DATA_PACK = 'DATA_PACK',
  PLUGIN = 'PLUGIN',
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  body?: string;
  iconUrl?: string;
  coverUrl?: string;
  sourceUrl?: string;
  downloads: number;
  views: number;
  status: ProjectStatus;
  projectType?: ProjectType;
  featured: boolean;
  promotedUntil?: string;
  clientSide: boolean;
  serverSide: boolean;
  authorId: string;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
  author?: { username: string; avatarUrl?: string };
  latestVersion?: string;
}

export interface DependencyInfo {
  id: string;
  name: string;
  slug: string;
  required: boolean;
}

export interface TeamMemberInfo {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface ProjectListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  /** Cursor for infinite scroll (treated as the next page by the API). */
  cursor?: string | null;
  search?: string;
  status?: ProjectStatus;
  author?: string;
  /** Single facets kept for backward compatibility; plural arrays preferred. */
  category?: string;
  loader?: string;
  gameVersion?: string;
  projectType?: string;
  license?: string;
  /** Modrinth-style multi-select facets (sent as CSV by the SDK). */
  categories?: string[];
  loaders?: string[];
  gameVersions?: string[];
  projectTypes?: string[];
  licenses?: string[];
  /** "client" | "server". */
  environments?: string[];
  /**
   * Explicit index signature so this object can be passed straight into
   * `URLSearchParams`/record-typed serializers (eg. the SDK's
   * `buildProjectQuery`) without TS rejecting the named keys. Without it,
   * a typed interface isn't assignable to `Record<string, ...>` even when
   * every declared property matches the value union.
   */
  [key: string]: string | number | string[] | null | undefined;
}

export interface Review {
  id: string;
  rating: number;
  title?: string;
  body?: string;
  userId: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface ReviewStats {
  average: number;
  count: number;
  distribution: Record<number, number>;
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  REJECTED = 'REJECTED',
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
  featured: boolean;
  clientSide: boolean;
  serverSide: boolean;
  authorId: string;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
  author?: { username: string; avatarUrl?: string };
  latestVersion?: string;
}

export interface ProjectListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  category?: string;
  loader?: string;
  search?: string;
  status?: ProjectStatus;
}

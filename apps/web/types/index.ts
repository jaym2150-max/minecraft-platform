import type { Project, Category, ProjectVersion, User } from '@mcp/types';

export type { Project, Category, ProjectVersion, User };

export interface PageProps {
  params: Record<string, string>;
  searchParams: Record<string, string | string[] | undefined>;
}

export interface SearchParams {
  q?: string;
  page?: string;
  limit?: string;
  sort?: string;
  category?: string;
  loader?: string;
}

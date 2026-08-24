export interface Collection {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  isPublic: boolean;
  userId: string;
  user?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  projectCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionDetail extends Collection {
  projects: CollectionProjectEntry[];
}

export interface CollectionProjectEntry {
  id: string;
  notes?: string;
  sortOrder: number;
  addedAt: string;
  project: {
    id: string;
    title: string;
    slug: string;
    description?: string;
    iconUrl?: string;
    downloads: number;
    author: { username: string };
  };
}

export interface CreateCollectionDto {
  name: string;
  description?: string;
  iconUrl?: string;
  isPublic?: boolean;
}

export interface AddProjectToCollectionDto {
  projectId: string;
  notes?: string;
}

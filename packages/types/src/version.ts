export enum VersionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum LoaderType {
  FABRIC = 'FABRIC',
  FORGE = 'FORGE',
  NEOFORGE = 'NEOFORGE',
  QUILT = 'QUILT',
  BUKKIT = 'BUKKIT',
  SPIGOT = 'SPIGOT',
  PAPER = 'PAPER',
  PURPUR = 'PURPUR',
}

export interface ProjectVersion {
  id: string;
  version: string;
  changelog?: string;
  fileUrl: string;
  fileSize: number;
  hash: string;
  downloads: number;
  status: VersionStatus;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  loaders: LoaderType[];
}

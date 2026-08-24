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

export interface MinecraftVersion {
  id: string;
  version: string;
  type: string;
  stable: boolean;
}

export interface ProjectVersion {
  id: string;
  version: string;
  changelog?: string;
  fileUrl: string;
  fileSize: number;
  hash: string;
  hashSha1?: string;
  hashSha256?: string;
  hashSha512?: string;
  downloads: number;
  status: VersionStatus;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  loaders: LoaderType[];
}

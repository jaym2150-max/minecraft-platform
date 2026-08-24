export type HashAlgorithm = 'sha1' | 'sha256' | 'sha512';

export interface VersionFileLookup {
  id: string;
  versionId: string;
  projectId: string;
  filename?: string;
  fileUrl: string;
  fileSize: number;
  hash: string;
  hashSha1?: string;
  hashSha512?: string;
  loaders?: string[];
  gameVersions?: string[];
}

export interface LatestVersionQuery {
  loaders?: string[];
  gameVersions?: string[];
}

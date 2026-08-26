/**
 * Provider-agnostic synchronization contracts.
 *
 * Every external content provider (Modrinth today, CurseForge later) is
 * adapted to these normalized shapes so the sync engine never touches
 * provider-specific payloads. External ids/slugs from different providers
 * are never interchangeable — links are keyed by (providerId, externalId).
 */

/** Our ProjectType enum values a provider project maps to. */
export type NormalizedProjectType =
  'MOD' | 'MODPACK' | 'RESOURCE_PACK' | 'SHADER' | 'DATA_PACK' | 'PLUGIN';

export interface NormalizedAuthor {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface NormalizedFile {
  url: string;
  filename: string;
  primary: boolean;
  size: number;
  sha1: string | null;
  sha512: string | null;
}

export interface NormalizedVersion {
  /** Provider's version id (stable across re-fetches). */
  externalId: string;
  versionNumber: string;
  changelog: string | null;
  gameVersions: string[];
  /** Provider loader slugs (lowercase), not yet mapped to our enum. */
  loaders: string[];
  downloads: number;
  datePublished: string;
  files: NormalizedFile[];
}

export interface NormalizedGalleryImage {
  url: string;
  title: string | null;
}

/** Full normalized project payload used for create/update decisions. */
export interface NormalizedProject {
  externalId: string;
  slug: string;
  title: string;
  description: string;
  /** Already converted to markdown when the provider serves HTML. */
  body: string | null;
  iconUrl: string | null;
  sourceUrl: string | null;
  discordUrl: string | null;
  wikiUrl: string | null;
  projectType: NormalizedProjectType;
  /** Provider category slugs. */
  categories: string[];
  downloads: number;
  follows: number;
  clientSide: boolean;
  serverSide: boolean;
  licenseShortId: string | null;
  licenseName: string | null;
  author: NormalizedAuthor;
  /** Provider's last-modified timestamp (ISO). */
  dateModified: string;
  /** Canonical page on the provider site. */
  externalUrl: string;
}

/** Lightweight hit returned by "updated since" / top searches. */
export interface ProviderSearchHit {
  externalId: string;
  slug: string;
  title: string;
  description: string;
  dateModified: string;
  downloads: number;
  follows: number;
  iconUrl: string | null;
  projectType: string;
}

export interface ProviderSearchPage {
  hits: ProviderSearchHit[];
  totalHits: number;
  offset: number;
}

export interface ProviderAdapter {
  readonly slug: string;
  readonly baseUrl: string;

  /** Full project fetch by external id or slug; null when not found. */
  getProject(idOrSlug: string): Promise<NormalizedProject | null>;
  /** All versions of a project, newest first. */
  getVersions(externalId: string): Promise<NormalizedVersion[]>;
  getGallery(externalId: string): Promise<NormalizedGalleryImage[]>;
  /** Batch fetch (provider-capped, e.g. 100 ids) for stats refresh. */
  getProjectsBatch(externalIds: string[]): Promise<NormalizedProject[]>;
  /** Top projects of one type ordered by downloads (full-import seeding). */
  searchTop(mrType: string, take: number): Promise<ProviderSearchHit[]>;
  /** Projects of one type ordered by updated desc (incremental paging). */
  searchUpdatedSince(
    mrType: string,
    opts: { limit: number; offset: number },
  ): Promise<ProviderSearchPage>;
}

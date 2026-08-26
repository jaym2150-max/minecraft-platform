/**
 * Modrinth `.mrpack` modpack manifest (the `modrinth.index.json` that sits at
 * the root of every .mrpack zip). On-the-wire shape uses snake_case to match
 * the Modrinth spec exactly, so a manifest produced here can be dropped into a
 * .mrpack archive and consumed by Prism / MultiMC / ATLauncher as-is.
 *
 * Spec: https://modrinth.com/docs/modpacks/format_modpack
 */

export const MRPACK_FORMAT_VERSION = 1 as const;

/** Per-file install environment. Maps directly to the modrinth index `env`. */
export type MrpackEnv = 'required' | 'optional' | 'unsupported';

export interface MrpackManifestHashes {
  /** SHA-1 hex digest — required by the spec. */
  sha1: string;
  /** SHA-512 hex digest — required by the spec. */
  sha512: string;
}

export interface MrpackManifestFile {
  /** Install path relative to the pack root, e.g. `mods/sodium_0.5.8.jar`. */
  path: string;
  hashes: MrpackManifestHashes;
  /** Candidate download URLs (CDN + origin). Launchers try them in order. */
  downloads: string[];
  /** File size in bytes. */
  file_size: number;
  /** Where the file is needed: client, server, or both. */
  env: { client: MrpackEnv; server: MrpackEnv };
}

/**
 * The `dependencies` block of a .mrpack index. Keys are loader identifiers
 * (`minecraft`, `fabric-loader`, …); values are required versions.
 */
export interface MrpackManifestDependencies {
  minecraft?: string;
  'fabric-loader'?: string;
  forge?: string;
  'quilt-loader'?: string;
  neoforge?: string;
  paper?: string;
}

export interface MrpackManifest {
  format_version: typeof MRPACK_FORMAT_VERSION;
  game: 'minecraft';
  /** The modpack's own version string, e.g. `1.4.2`. */
  version_id: string;
  name: string;
  summary: string | null;
  files: MrpackManifestFile[];
  dependencies: MrpackManifestDependencies;
}

/**
 * Project-level loader × game-version compatibility matrix, derived by
 * aggregating the per-version `Loader` rows of the project's approved
 * versions. This is what powers the "Fabric 1.20.1" tag UI — the existing
 * `Loader` table (loader type + `versionString`) already encodes this, so no
 * separate cache table is required for reads.
 */
export interface ProjectCompatibilityLoader {
  /** LoaderType enum value, e.g. `FABRIC`. */
  loader: string;
  gameVersions: string[];
}

export interface ProjectCompatibility {
  projectId: string;
  slug: string;
  loaders: ProjectCompatibilityLoader[];
  /** Union of all game versions the project supports across any loader. */
  gameVersions: string[];
}

export type ResolutionConflictKind =
  'MISSING' | 'INCOMPATIBLE' | 'CYCLE' | 'LOADER_MISMATCH' | 'VERSION_MISMATCH';

export interface ResolutionConflict {
  kind: ResolutionConflictKind;
  message: string;
  dependentId: string;
  requiredId?: string;
  dependencyId?: string;
}

export interface ResolutionNode {
  projectId: string;
  slug: string;
  title: string;
  version: string | null;
  versionId: string | null;
  loaderType: string | null;
  gameVersion: string | null;
  score: number;
  children: string[];
  depth: number;
}

export interface ResolvedModpack {
  nodes: Record<string, ResolutionNode>;
  roots: string[];
  conflicts: ResolutionConflict[];
  score: number;
  resolvedCount: number;
}

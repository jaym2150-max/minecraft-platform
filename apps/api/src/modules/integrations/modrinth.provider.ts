import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { htmlToMarkdown, looksLikeHtml } from './html-to-markdown';
import type {
  NormalizedGalleryImage,
  NormalizedProject,
  NormalizedProjectType,
  NormalizedVersion,
  ProviderAdapter,
  ProviderSearchHit,
  ProviderSearchPage,
} from './provider.types';

/** Modrinth loader slug → our LoaderType enum. Unknown loaders are skipped. */
export const LOADER_MAP: Record<string, string> = {
  fabric: 'FABRIC',
  forge: 'FORGE',
  neoforge: 'NEOFORGE',
  quilt: 'QUILT',
  bukkit: 'BUKKIT',
  spigot: 'SPIGOT',
  paper: 'PAPER',
  purpur: 'PURPUR',
};

/** Modrinth project_type → our ProjectType. Unknown types default to MOD. */
export function mapProjectType(mrType: string): NormalizedProjectType {
  switch (mrType) {
    case 'modpack':
      return 'MODPACK';
    case 'resourcepack':
      return 'RESOURCE_PACK';
    case 'shader':
      return 'SHADER';
    case 'datapack':
      return 'DATA_PACK';
    case 'plugin':
      return 'PLUGIN';
    default:
      return 'MOD';
  }
}

/** Canonical Modrinth page URL for a project type. */
export function modrinthProjectUrl(mrType: string, slug: string): string {
  const path = mapProjectType(mrType) === 'MOD' ? 'mod' : mrType;
  return `https://modrinth.com/${path}/${slug}`;
}

export interface ModrinthProviderOptions {
  apiUrl?: string;
  userAgent?: string;
  /** Politeness floor between requests. */
  minRequestIntervalMs?: number;
  /** Injectable clock-sleep (tests). */
  sleep?: (ms: number) => Promise<void>;
  /** Injectable fetch (tests). */
  fetchImpl?: typeof fetch;
}

const DEFAULT_API_URL = 'https://api.modrinth.com/v2';
const DEFAULT_UA = 'minecraft-platform/1.0 (+https://github.com/jaym2150-max/minecraft-platform)';
const REQUEST_TIMEOUT_MS = 15000;
const MAX_ATTEMPTS = 4;

/**
 * Hardened Modrinth v2 API client behind the ProviderAdapter contract.
 *
 * Etiquette/per ToS: descriptive User-Agent, ~4 req/s ceiling (min interval
 * between requests), honour 429 Retry-After and X-RateLimit-* headers, and
 * retry transient 5xx/network failures with exponential backoff instead of
 * dropping the whole sync.
 */
@Injectable()
export class ModrinthProvider implements ProviderAdapter {
  readonly slug = 'modrinth';
  readonly baseUrl = 'https://modrinth.com';

  private readonly logger = new Logger(ModrinthProvider.name);
  private readonly apiUrl: string;
  private readonly userAgent: string;
  private readonly minRequestIntervalMs: number;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly fetchImpl: typeof fetch;

  private lastRequestAt = 0;
  private rateLimitResetAt = 0;

  /** Public view of the configured API base (stored on provider rows). */
  get apiUrlPublic(): string {
    return this.apiUrl;
  }

  constructor(config?: ConfigService, opts: ModrinthProviderOptions = {}) {
    this.apiUrl = (
      opts.apiUrl ??
      config?.get<string>('MODRINTH_API_URL') ??
      DEFAULT_API_URL
    ).replace(/\/$/, '');
    this.userAgent = opts.userAgent ?? config?.get<string>('MODRINTH_USER_AGENT') ?? DEFAULT_UA;
    this.minRequestIntervalMs = opts.minRequestIntervalMs ?? 250;
    this.sleep = opts.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  /** GET with timeout, retry/backoff and rate-limit politeness. Null on 404. */
  async request<T>(path: string): Promise<T | null> {
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      await this.throttle();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const res = await this.fetchImpl(`${this.apiUrl}${path}`, {
          headers: { 'User-Agent': this.userAgent },
          signal: controller.signal,
        });
        this.ingestRateHeaders(res.headers);

        if (res.status === 404) return null;
        if (res.status === 429 || res.status >= 500) {
          const retryAfterSec = Number(res.headers.get('retry-after'));
          const backoffMs =
            res.status === 429
              ? Math.max(1000, (Number.isFinite(retryAfterSec) ? retryAfterSec : 2) * 1000)
              : 500 * 3 ** (attempt - 1);
          this.logger.warn(`Modrinth ${path} → ${res.status}; retrying in ${backoffMs}ms`);
          if (attempt === MAX_ATTEMPTS) return null;
          await this.sleep(backoffMs);
          continue;
        }
        if (!res.ok) {
          this.logger.warn(`Modrinth ${path} → ${res.status}`);
          return null;
        }
        return (await res.json()) as T;
      } catch (err: any) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt === MAX_ATTEMPTS) break;
        await this.sleep(500 * 3 ** (attempt - 1));
      } finally {
        clearTimeout(timer);
      }
    }
    throw new Error(
      `Modrinth ${path} failed after ${MAX_ATTEMPTS} attempts: ${lastError?.message}`,
    );
  }

  private async throttle(): Promise<void> {
    const now = Date.now();
    if (this.rateLimitResetAt > now) {
      await this.sleep(this.rateLimitResetAt - now + 50);
      this.rateLimitResetAt = 0;
    }
    const wait = this.lastRequestAt + this.minRequestIntervalMs - Date.now();
    if (wait > 0) await this.sleep(wait);
    this.lastRequestAt = Date.now();
  }

  private ingestRateHeaders(headers: Headers): void {
    const remaining = headers.get('x-ratelimit-remaining');
    const reset = headers.get('x-ratelimit-reset');
    if (remaining === '0' && reset) {
      const resetMs = Number(reset) * 1000;
      if (Number.isFinite(resetMs) && resetMs > Date.now()) this.rateLimitResetAt = resetMs;
    }
  }

  // ---- ProviderAdapter -------------------------------------------------

  async getProject(idOrSlug: string): Promise<NormalizedProject | null> {
    const full = await this.request<any>(`/project/${encodeURIComponent(idOrSlug)}`);
    if (!full) return null;
    return this.normalizeProject(full);
  }

  async getVersions(externalId: string): Promise<NormalizedVersion[]> {
    const versions = await this.request<any[]>(
      `/project/${encodeURIComponent(externalId)}/version`,
    );
    return (versions ?? [])
      .map((v): NormalizedVersion => {
        const files = (v.files ?? []).map((f: any) => ({
          url: f.url,
          filename: f.filename,
          primary: Boolean(f.primary),
          size: Number(f.size ?? 0),
          sha1: f.hashes?.sha1 ?? null,
          sha512: f.hashes?.sha512 ?? null,
        }));
        return {
          externalId: v.id,
          versionNumber: String(v.version_number ?? ''),
          changelog: v.changelog ?? null,
          gameVersions: v.game_versions ?? [],
          loaders: v.loaders ?? [],
          downloads: Number(v.downloads ?? 0),
          datePublished: v.date_published ?? '',
          files,
        };
      })
      .filter((v) => v.versionNumber && v.files.length > 0);
  }

  async getGallery(externalId: string): Promise<NormalizedGalleryImage[]> {
    const gallery = await this.request<any[]>(`/project/${encodeURIComponent(externalId)}/gallery`);
    return (gallery ?? []).map((g) => ({ url: g.url, title: g.title ?? null }));
  }

  async getProjectsBatch(externalIds: string[]): Promise<NormalizedProject[]> {
    if (externalIds.length === 0) return [];
    // Modrinth caps the ids array at 100 per request.
    const out: NormalizedProject[] = [];
    for (let i = 0; i < externalIds.length; i += 100) {
      const chunk = externalIds.slice(i, i + 100);
      const ids = encodeURIComponent(JSON.stringify(chunk));
      const projects = await this.request<any[]>(`/projects?ids=${ids}`);
      for (const p of projects ?? []) {
        try {
          out.push(this.normalizeProject(p));
        } catch (err: any) {
          this.logger.warn(`Skipping malformed batch project ${p?.id}: ${err?.message}`);
        }
      }
    }
    return out;
  }

  async searchTop(mrType: string, take: number): Promise<ProviderSearchHit[]> {
    const facets = encodeURIComponent(JSON.stringify([[`project_type:${mrType}`]]));
    const page = await this.request<any>(`/search?limit=${take}&index=downloads&facets=${facets}`);
    return (page?.hits ?? []).map((h: any) => this.normalizeHit(h));
  }

  async searchUpdatedSince(
    mrType: string,
    opts: { limit: number; offset: number },
  ): Promise<ProviderSearchPage> {
    const facets = encodeURIComponent(JSON.stringify([[`project_type:${mrType}`]]));
    const page = await this.request<any>(
      `/search?limit=${opts.limit}&offset=${opts.offset}&index=updated&facets=${facets}`,
    );
    return {
      hits: (page?.hits ?? []).map((h: any) => this.normalizeHit(h)),
      totalHits: Number(page?.total_hits ?? 0),
      offset: opts.offset,
    };
  }

  // ---- Normalization ----------------------------------------------------

  private normalizeHit(h: any): ProviderSearchHit {
    return {
      externalId: h.project_id,
      slug: h.slug,
      title: h.title ?? h.slug,
      description: h.description ?? '',
      dateModified: h.date_modified ?? '',
      downloads: Number(h.downloads ?? 0),
      follows: Number(h.follows ?? 0),
      iconUrl: h.icon_url ?? null,
      projectType: h.project_type ?? 'mod',
    };
  }

  private normalizeProject(full: any): NormalizedProject {
    const rawBody: string | null =
      typeof full.body === 'string' && full.body.trim().length > 40 ? full.body : null;
    const side = (v: string | undefined) => v !== 'unsupported' && v !== 'unknown';
    return {
      externalId: full.id,
      slug: full.slug,
      title: full.title ?? full.slug,
      description: full.description ?? '',
      body: rawBody ? (looksLikeHtml(rawBody) ? htmlToMarkdown(rawBody) : rawBody) : null,
      iconUrl: full.icon_url ?? null,
      sourceUrl: full.source_url ?? null,
      discordUrl: full.discord_url ?? null,
      wikiUrl: full.issues_url ?? null,
      projectType: mapProjectType(full.project_type ?? 'mod'),
      categories: full.categories ?? full.display_categories ?? [],
      downloads: Number(full.downloads ?? 0),
      follows: Number(full.follows ?? 0),
      clientSide: side(full.client_side),
      serverSide: side(full.server_side),
      licenseShortId: full.license?.id ? String(full.license.id).toUpperCase() : null,
      licenseName: full.license?.name ?? null,
      author: {
        username: full.organization ?? full.author ?? `${full.slug}-team`,
        displayName: full.author ?? null,
        // The project payload carries no avatar; keep null (profile pages
        // fall back to initials).
        avatarUrl: null,
      },
      dateModified: full.updated ?? full.date_modified ?? '',
      externalUrl: modrinthProjectUrl(full.project_type ?? 'mod', full.slug),
    };
  }
}

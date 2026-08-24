import { ApiClient } from '@mcp/utils';
import type {
  User,
  UserProfile,
  Project,
  ProjectListQuery,
  ProjectVersion,
  Category,
  MinecraftVersion,
  ApiResponse,
  PaginatedResponse,
  DependencyInfo,
  TeamMemberInfo,
  Collection,
  CollectionDetail,
  CreateCollectionDto,
  AddProjectToCollectionDto,
  GalleryImage,
  License,
  LicenseListItem,
  Thread,
  ThreadMessage,
  ApiKeyInfo,
  ApiKeyWithSecret,
  ApiKeyScope,
  InstanceStatistics,
  VersionFileLookup,
  HashAlgorithm,
  LatestVersionQuery,
  MrpackManifest,
  ProjectCompatibility,
} from '@mcp/types';

/**
 * Serialize a `ProjectListQuery` (plus optional extra facets like `author`)
 * into a CSV-joined querystring. Shared by `listProjects` and
 * `getUserProjects` (C47) so array facets round-trip identically regardless
 * of which entry point the caller used — the backend `@Transform(toArray)`
 * splits the CSV back into arrays the same way for every caller path.
 */
function buildProjectQuery(
  query: Record<string, string | number | string[] | undefined | null>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(','));
    } else {
      params.set(key, String(value));
    }
  }
  return params.toString();
}

export class McpSDK {
  /** Exposed read-only for advanced consumers (dashboard panels) that need
   * raw request access beyond the typed helpers. */
  readonly client: ApiClient;

  constructor(baseUrl?: string) {
    this.client = new ApiClient(baseUrl);
  }

  setAuthToken(token: string): void {
    this.client.setAuthToken(token);
  }

  clearAuthToken(): void {
    this.client.clearAuthToken();
  }

  /**
   * Login. The access token is delivered via an httpOnly cookie set by the
   * server (never present in the JSON body), which is why the response shape
   * only carries the user. Headless / CLI callers that authenticate with an
   * API key use `setAuthToken` instead and don't go through this path.
   */
  async login(email: string, password: string) {
    return this.client.post<ApiResponse<{ user: User }>>('/auth/login', { email, password });
  }

  async register(data: { username: string; email: string; password: string }) {
    return this.client.post<ApiResponse<{ user: User }>>('/auth/register', data);
  }

  async sendVerificationEmail(email: string) {
    return this.client.post<ApiResponse<void>>('/auth/send-verification-email', { email });
  }

  async verifyEmail(token: string) {
    return this.client.post<ApiResponse<void>>('/auth/verify-email', { token });
  }

  async resendVerification() {
    return this.client.post<ApiResponse<void>>('/auth/resend-verification', {});
  }

  async getMe() {
    return this.client.get<ApiResponse<User>>('/auth/me');
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.client.post<ApiResponse<void>>('/auth/change-password', data);
  }

  async saveNotificationPreferences(preferences: Record<string, boolean>) {
    return this.client.post<ApiResponse<void>>('/users/me/notification-preferences', { preferences });
  }

  async getUserAnalytics(period: '7d' | '30d' | '90d' | '1y' | 'all' = '30d') {
    return this.client.get<ApiResponse<any>>(`/analytics/user?period=${period}`);
  }

  async getProjectAnalytics(projectId: string, period: '7d' | '30d' | '90d' | '1y' | 'all' = '30d') {
    return this.client.get<ApiResponse<any>>(`/analytics/project/${projectId}?period=${period}`);
  }

  async enable2FA() {
    return this.client.post<ApiResponse<{ secret: string; qrCodeUrl: string; backupCodes: string[] }>>('/auth/2fa/enable', {});
  }

  async verify2FA(code: string) {
    return this.client.post<ApiResponse<void>>('/auth/2fa/verify', { code });
  }

  async disable2FA(code: string) {
    return this.client.post<ApiResponse<void>>('/auth/2fa/disable', { code });
  }

  async deleteAccount(password: string) {
    return this.client.post<ApiResponse<void>>('/users/me/delete', { password });
  }

  async getSessions() {
    return this.client.get<ApiResponse<any[]>>('/users/me/sessions');
  }

  async revokeSession(sessionId: string) {
    return this.client.delete<ApiResponse<void>>(`/users/me/sessions/${sessionId}`);
  }

  async revokeAllOtherSessions() {
    return this.client.post<ApiResponse<void>>('/users/me/sessions/revoke-all', {});
  }

  async getUser(username: string) {
    return this.client.get<ApiResponse<UserProfile>>(`/users/${username}`);
  }

  async followUser(userId: string) {
    return this.client.post<ApiResponse<void>>(`/users/me/follow`, { userId });
  }

  async unfollowUser(userId: string) {
    return this.client.delete<ApiResponse<void>>(`/users/me/unfollow/${userId}`);
  }

  async updateProfile(data: Partial<User>) {
    return this.client.patch<ApiResponse<User>>('/users/me', data);
  }

  async listProjects(query?: ProjectListQuery) {
    if (!query) {
      return this.client.get<PaginatedResponse<Project>>('/projects');
    }
    // Enum-valued facets map assemble their querystring here.
    return this.client.get<PaginatedResponse<Project>>(
      `/projects?${buildProjectQuery(query)}`,
    );
  }

  async getProject(slug: string) {
    return this.client.get<ApiResponse<Project>>(`/projects/${slug}`);
  }

  async createProject(data: Partial<Project>) {
    return this.client.post<ApiResponse<Project>>('/projects', data);
  }

  async updateProject(id: string, data: Partial<Project>) {
    return this.client.patch<ApiResponse<Project>>(`/projects/${id}`, data);
  }

  async deleteProject(id: string) {
    return this.client.delete<ApiResponse<void>>(`/projects/${id}`);
  }

  /**
   * Fetch a project's versions, optionally filtered by loader and/or game
   * version — Modrinth's `/mod/:slug/versions?l=Fabric&g=1.20.1` equivalent.
   */
  async getProjectVersions(
    projectId: string,
    opts?: { loaders?: string[]; gameVersions?: string[] },
  ) {
    const params = new URLSearchParams();
    if (opts?.loaders?.length) params.set('loaders', opts.loaders.join(','));
    if (opts?.gameVersions?.length) params.set('gameVersions', opts.gameVersions.join(','));
    const qs = params.toString();
    return this.client.get<ApiResponse<ProjectVersion[]>>(
      `/projects/${projectId}/versions${qs ? `?${qs}` : ''}`,
    );
  }

  async createVersion(projectId: string, data: Partial<ProjectVersion>) {
    return this.client.post<ApiResponse<ProjectVersion>>(`/projects/${projectId}/versions`, data);
  }

  async updateVersion(projectId: string, versionId: string, data: Partial<ProjectVersion>) {
    return this.client.patch<ApiResponse<ProjectVersion>>(`/projects/${projectId}/versions/${versionId}`, data);
  }

  async deleteVersion(projectId: string, versionId: string) {
    return this.client.delete<ApiResponse<any>>(`/projects/${projectId}/versions/${versionId}`);
  }

  async getProjectDependencies(projectId: string) {
    return this.client.get<ApiResponse<DependencyInfo[]>>(`/projects/${projectId}/dependencies`);
  }

  async getProjectTeam(projectId: string) {
    return this.client.get<ApiResponse<TeamMemberInfo[]>>(`/projects/${projectId}/team`);
  }

  async addTeamMember(teamId: string, data: { userId: string; role: string }) {
    return this.client.post<ApiResponse<any>>(`/teams/${teamId}/members`, data);
  }

  async updateTeamMember(teamId: string, memberId: string, data: { role: string }) {
    return this.client.patch<ApiResponse<any>>(`/teams/${teamId}/members/${memberId}`, data);
  }

  async removeTeamMember(teamId: string, memberId: string) {
    return this.client.delete<ApiResponse<any>>(`/teams/${teamId}/members/${memberId}`);
  }

  async listMinecraftVersions() {
    return this.client.get<ApiResponse<MinecraftVersion[]>>('/minecraft-versions');
  }

  async listCategories() {
    return this.client.get<ApiResponse<Category[]>>('/categories');
  }

  async search(query: string, options?: { page?: number; limit?: number }) {
    return this.client.get<PaginatedResponse<Project>>(
      `/search?q=${encodeURIComponent(query)}&page=${options?.page || 1}&limit=${options?.limit || 20}`,
    );
  }

  async getRelatedProjects(categoryId: string, excludeSlug?: string) {
    const query = `?category=${categoryId}&limit=4${excludeSlug ? `&exclude=${excludeSlug}` : ''}`;
    return this.client.get<PaginatedResponse<Project>>(`/projects${query}`);
  }

  async getProjectRelated(slug: string) {
    return this.client.get<ApiResponse<Project[]>>(`/projects/${slug}/related`);
  }

  async getProjectReviews(projectId: string, page = 1, limit = 20) {
    return this.client.get<any>(`/reviews/project/${projectId}?page=${page}&limit=${limit}`);
  }

  async getReviewStats(projectId: string) {
    return this.client.get<any>(`/reviews/project/${projectId}/stats`);
  }

  async createReview(data: { rating: number; title?: string; body?: string; projectId: string }) {
    return this.client.post<any>('/reviews', data);
  }

  async updateReview(id: string, data: { rating?: number; title?: string; body?: string }) {
    return this.client.patch<any>(`/reviews/${id}`, data);
  }

  async deleteReview(id: string) {
    return this.client.delete<any>(`/reviews/${id}`);
  }

  async followProject(slug: string) {
    return this.client.post<any>(`/projects/${slug}/follow`, {});
  }

  async unfollowProject(slug: string) {
    return this.client.delete<any>(`/projects/${slug}/follow`);
  }

  async checkFollow(slug: string) {
    return this.client.get<any>(`/projects/${slug}/follow/check`);
  }

  async getProjectFollowers(slug: string, page = 1, limit = 20) {
    return this.client.get<any>(`/projects/${slug}/followers?page=${page}&limit=${limit}`);
  }

  async getMyFollowing(page = 1, limit = 20) {
    return this.client.get<any>(`/users/me/following?page=${page}&limit=${limit}`);
  }

  async getFollowingActivity(page = 1, limit = 20) {
    return this.client.get<any>(`/users/me/following/activity?page=${page}&limit=${limit}`);
  }

  async getProjectGallery(slug: string) {
    return this.client.get<ApiResponse<GalleryImage[]>>(`/projects/${slug}/gallery`);
  }

  async uploadGalleryImage(slug: string, file: File, alt?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (alt) formData.append('alt', alt);
    return this.client.post<ApiResponse<GalleryImage>>(`/projects/${slug}/gallery`, formData);
  }

  async uploadFile(projectId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.client.post<ApiResponse<{ uploadId: string; projectVersionId: string; fileUrl: string; filename: string; size: number; hash: string; status: string; scanStatus: string }>>(
      `/uploads/project/${projectId}`,
      formData,
    );
  }

  async getUploadStatus(uploadId: string) {
    return this.client.get<ApiResponse<{ uploadId: string; status: string; progress?: number }>>(
      `/uploads/${uploadId}/status`,
    );
  }

  async updateGalleryItem(id: string, data: { alt?: string; order?: number }) {
    return this.client.patch<ApiResponse<GalleryImage>>(`/gallery/${id}`, data);
  }

  async deleteGalleryItem(id: string) {
    return this.client.delete<ApiResponse<any>>(`/gallery/${id}`);
  }

  async getCommentsByProject(projectId: string, page = 1, limit = 20) {
    return this.client.get<any>(`/comments/project/${projectId}?page=${page}&limit=${limit}`);
  }

  async createComment(data: { content: string; projectId: string; parentId?: string }) {
    return this.client.post<any>('/comments', data);
  }

  async updateComment(id: string, data: { content: string }) {
    return this.client.patch<any>(`/comments/${id}`, data);
  }

  async deleteComment(id: string) {
    return this.client.delete<any>(`/comments/${id}`);
  }

  async reorderGallery(slug: string, ids: string[]) {
    return this.client.put<ApiResponse<any>>(`/projects/${slug}/gallery/reorder`, { ids });
  }

  async createCollection(data: CreateCollectionDto) {
    return this.client.post<ApiResponse<Collection>>('/collections', data);
  }

  async listCollections(params?: { userId?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.userId) query.set('userId', params.userId);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return this.client.get<any>(`/collections?${query.toString()}`);
  }

  async getMyCollections(page = 1, limit = 20) {
    return this.client.get<any>(`/collections/mine?page=${page}&limit=${limit}`);
  }

  async getCollection(id: string) {
    return this.client.get<ApiResponse<CollectionDetail>>(`/collections/${id}`);
  }

  async updateCollection(id: string, data: Partial<CreateCollectionDto>) {
    return this.client.patch<ApiResponse<Collection>>(`/collections/${id}`, data);
  }

  async deleteCollection(id: string) {
    return this.client.delete<ApiResponse<any>>(`/collections/${id}`);
  }

  async addProjectToCollection(collectionId: string, data: AddProjectToCollectionDto) {
    return this.client.post<ApiResponse<any>>(`/collections/${collectionId}/projects`, data);
  }

  async removeProjectFromCollection(collectionId: string, projectId: string) {
    return this.client.delete<ApiResponse<any>>(`/collections/${collectionId}/projects/${projectId}`);
  }

  async listPlans() {
    return this.client.get<ApiResponse<any>>('/billing/plans');
  }

  async getUserProjects(userId: string, query?: ProjectListQuery) {
    // C47 (AUDIT.md): previously this method used a hand-rolled
    // `new URLSearchParams(params as Record<string, string>)` which left
    // arrays to `.toString()` (works but is implicit + browser-dependent for
    // numbers) while `listProjects` used the explicit `value.join(',')` pattern.
    // Both now use the shared `buildProjectQuery` helper so enum-facet arrays
    // serialize identically and the backend `@Transform(toArray)` strips the
    // CSV back out the same way from any caller path.
    const qs = buildProjectQuery({ ...query, author: userId });
    return this.client.get<PaginatedResponse<Project>>(
      qs ? `/projects?${qs}` : '/projects',
    );
  }

  async listLicenses() {
    return this.client.get<ApiResponse<LicenseListItem[]>>('/licenses');
  }

  async getLicense(shortId: string) {
    return this.client.get<ApiResponse<License>>(`/licenses/${shortId}`);
  }

  async getLicenseText(shortId: string) {
    return this.client.get<ApiResponse<{ shortId: string; body: string }>>(`/licenses/${shortId}/text`);
  }

  /**
   * Look up a single version file by its content hash. The server default and
   * our DB primary hash column are SHA-256, so the default algorithm here is
   * `'sha256'` (not sha1). Route: `GET /version-files/:hash?algorithm=`.
   */
  async getVersionByHash(hash: string, algorithm: HashAlgorithm = 'sha256') {
    const qs = algorithm === 'sha256' ? '' : `?algorithm=${algorithm}`;
    return this.client.get<ApiResponse<VersionFileLookup>>(
      `/version-files/${hash}${qs}`,
    );
  }

  /**
   * Given a content hash, return the latest matching version for the supplied
   * loader / game-version combo. Route: `GET /version-files/latest?hash=…`.
   * (Server reads `loaders` and `gameVersions`, not snake_case.)
   */
  async getLatestVersionFromHash(hash: string, opts?: LatestVersionQuery) {
    const params = new URLSearchParams({ hash });
    if (opts?.loaders?.length) params.set('loaders', opts.loaders.join(','));
    if (opts?.gameVersions?.length) params.set('gameVersions', opts.gameVersions.join(','));
    return this.client.get<ApiResponse<VersionFileLookup>>(
      `/version-files/latest?${params.toString()}`,
    );
  }

  /**
   * Bulk lookup keyed by content hash. Returns a map keyed by the requested
   * hash so callers can correlate results back to their input. Route:
   * `POST /version-files/bulk` with body `{ hashes, algorithm }`.
   */
  async getVersionsFromHashes(hashes: string[], algorithm: HashAlgorithm = 'sha256') {
    return this.client.post<ApiResponse<Record<string, VersionFileLookup>>>(
      '/version-files/bulk',
      { hashes, algorithm },
    );
  }

  /**
   * For each (hash, loaders, gameVersions) entry, resolve the latest matching
   * version. The server has no vectorized endpoint for this, so we fan out to
   * `getLatestVersionFromHash` per item (capped to avoid thundering herds) and
   * return a map keyed by the supplied hash; missing hashes are null.
   */
  async getLatestVersionsFromHashes(
    items: { hash: string; loaders?: string[]; gameVersions?: string[] }[],
  ) {
    const limit = 50;
    const batch = items.slice(0, limit);
    const results = await Promise.all(
      batch.map((it) =>
        this.getLatestVersionFromHash(it.hash, {
          loaders: it.loaders,
          gameVersions: it.gameVersions,
        })
          .then((res) => (res as any).data ?? null)
          .catch(() => null),
      ),
    );
    return {
      statusCode: 200,
      message: 'Latest versions retrieved',
      timestamp: new Date().toISOString(),
      data: batch.reduce<Record<string, VersionFileLookup | null>>((acc, it, i) => {
        acc[it.hash] = results[i];
        return acc;
      }, {}),
    } as unknown as ApiResponse<Record<string, VersionFileLookup | null>>;
  }

  /** Resolve a modpack's `modrinth.index.json` manifest (latest approved version). */
  async getModpackManifest(slug: string) {
    return this.client.get<ApiResponse<MrpackManifest>>(`/projects/${slug}/modpack/manifest`);
  }

  /** Resolve a modpack's manifest for a specific version. */
  async getModpackManifestForVersion(slug: string, versionId: string) {
    return this.client.get<ApiResponse<MrpackManifest>>(
      `/projects/${slug}/versions/${versionId}/modpack/manifest`,
    );
  }

  /** Loader × game-version compatibility matrix for a project. */
  async getProjectCompatibility(slug: string) {
    return this.client.get<ApiResponse<ProjectCompatibility>>(
      `/projects/${slug}/compatibility`,
    );
  }

  async getProjects(ids: string[]) {
    return this.client.get<ApiResponse<Project[]>>(`/projects?ids=${ids.join(',')}`);
  }

  async getVersions(ids: string[]) {
    return this.client.get<ApiResponse<ProjectVersion[]>>(`/versions?ids=${ids.join(',')}`);
  }

  async getUsers(ids: string[]) {
    return this.client.get<ApiResponse<User[]>>(`/users?ids=${ids.join(',')}`);
  }

  async getStatistics() {
    return this.client.get<ApiResponse<InstanceStatistics>>('/statistics');
  }

  async getRandomProjects(count = 10) {
    return this.client.get<ApiResponse<Project[]>>(`/projects/random?count=${count}`);
  }

  /**
   * Build the OAuth-start URL for the given provider.
   *
   * B11: the previous implementation interpolated `provider` raw into the
   * URL string — `${base}/auth/${provider}` — with only the TypeScript
   * type `'github' | 'discord'` guarding it. A caller passing
   * `provider='//evil.com/x'` would have built `…/auth///evil.com/x`, an
   * open-redirect / SSRF vector if any code path later followed this URL
   * and forwarded a session cookie or Authorization header. We now:
   *   - validate `provider` against an allowlist BEFORE interpolation;
   *   - resolve the base through `new URL(...)` and recombine via
   *     URL the API so the result is always a single well-formed URL on
   *     the configured origin;
   *   - keep the `state` param URL-encoded (single source of randomness
   *     passed back by the provider for CSRF).
   */
  oauthUrl(provider: 'github' | 'discord', state: string) {
    const ALLOWED_PROVIDERS = ['github', 'discord'] as const;
    type Allowed = (typeof ALLOWED_PROVIDERS)[number];
    const safeProvider: Allowed = ALLOWED_PROVIDERS.includes(provider as Allowed)
      ? (provider as Allowed)
      : 'github';
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const authUrl = new URL(`/auth/${encodeURIComponent(safeProvider)}`, base);
    authUrl.searchParams.set('state', state);
    return authUrl.toString();
  }

  async getMyThreads(page = 1, limit = 20) {
    return this.client.get<ApiResponse<Thread[]>>(`/threads/mine?page=${page}&limit=${limit}`);
  }

  async getThread(id: string) {
    return this.client.get<ApiResponse<Thread>>(`/threads/${id}`);
  }

  async sendThreadMessage(threadId: string, body: string) {
    return this.client.post<ApiResponse<ThreadMessage>>(`/threads/${threadId}/messages`, { body });
  }

  async createApiKey(data: { name: string; scopes: ApiKeyScope[]; ipAllowlist?: string[]; expiresAt?: string }) {
    return this.client.post<ApiResponse<ApiKeyWithSecret>>('/api-keys', data);
  }

  async listApiKeys() {
    return this.client.get<ApiResponse<ApiKeyInfo[]>>('/api-keys');
  }

  async revokeApiKey(id: string) {
    return this.client.delete<ApiResponse<void>>(`/api-keys/${id}`);
  }
}

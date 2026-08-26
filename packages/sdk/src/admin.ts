import { ApiClient } from '@mcp/utils/api-client';
import type { ApiResponse, PaginatedResponse, User, Project } from '@mcp/types';

/**
 * McpAdminSDK — admin / moderation surface.
 *
 * This is deliberately split from {@link McpSDK} so the privileged methods
 * (ban/unban, role/tier changes, project status overrides, report resolution,
 * admin analytics, license authoring) are NEVER bundled into the web client
 * unless a route actually imports `@mcp/sdk/admin`. The marketing / browse /
 * user-facing app imports only `McpSDK`, so none of this admin code ends up in
 * shared client chunks that every visitor downloads.
 *
 * Server-side authorization is still the source of truth (NestJS guards enforce
 * ADMIN/OWNER roles); this split is a transport-size and attack-surface
 * reduction, NOT a security boundary on its own.
 */
export class McpAdminSDK {
  private client: ApiClient;

  constructor(baseUrl?: string) {
    this.client = new ApiClient(baseUrl);
  }

  setAuthToken(token: string): void {
    this.client.setAuthToken(token);
  }

  clearAuthToken(): void {
    this.client.clearAuthToken();
  }

  async listUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    banned?: boolean;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    if (params?.role) query.set('role', params.role);
    if (params?.banned !== undefined) query.set('banned', String(params.banned));
    return this.client.get<PaginatedResponse<User>>(`/admin/users?${query.toString()}`);
  }

  async changeUserRole(userId: string, role: string) {
    return this.client.patch<ApiResponse<User>>(`/admin/users/${userId}/role`, { role });
  }

  async changeUserTier(userId: string, tier: string) {
    return this.client.patch<ApiResponse<User>>(`/admin/users/${userId}/tier`, { tier });
  }

  async banUser(userId: string) {
    return this.client.post<ApiResponse<User>>(`/admin/users/${userId}/ban`, {});
  }

  async unbanUser(userId: string) {
    return this.client.post<ApiResponse<User>>(`/admin/users/${userId}/unban`, {});
  }

  async updateProjectStatus(projectId: string, status: string) {
    return this.client.patch<ApiResponse<Project>>(`/admin/projects/${projectId}/status`, {
      status,
    });
  }

  async updateProjectFeature(projectId: string, featured: boolean) {
    return this.client.patch<ApiResponse<Project>>(`/admin/projects/${projectId}/feature`, {
      featured,
    });
  }

  async getAdminAnalytics() {
    return this.client.get<ApiResponse<Record<string, any>>>('/admin/analytics');
  }

  async listReports(params?: { page?: number; limit?: number; status?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.status) query.set('status', params.status);
    return this.client.get<PaginatedResponse<any>>(`/moderation/reports?${query.toString()}`);
  }

  async getReportStats() {
    return this.client.get<ApiResponse<Record<string, any>>>('/moderation/reports/stats');
  }

  async resolveReport(id: string, data: { status: string; resolution?: string }) {
    return this.client.post<ApiResponse<any>>(`/moderation/reports/${id}/resolve`, data);
  }

  async createLicense(data: Partial<import('@mcp/types').License>) {
    return this.client.post<ApiResponse<import('@mcp/types').License>>('/admin/licenses', data);
  }
}

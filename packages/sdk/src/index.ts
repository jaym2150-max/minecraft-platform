import { ApiClient } from '@mcp/utils/api-client';
import type {
  User, UserProfile,
  Project, ProjectListQuery,
  ProjectVersion,
  Category,
  ApiResponse, PaginatedResponse,
} from '@mcp/types';

export class McpSDK {
  private client: ApiClient;

  constructor(baseUrl?: string) {
    this.client = new ApiClient(baseUrl);
  }

  setAuthToken(token: string) {
    this.client.setAuthToken(token);
  }

  clearAuthToken() {
    this.client.clearAuthToken();
  }

  // Auth
  async login(email: string, password: string) {
    return this.client.post<ApiResponse<{ user: User; token: string }>>('/auth/login', { email, password });
  }

  async register(data: { username: string; email: string; password: string }) {
    return this.client.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data);
  }

  async getMe() {
    return this.client.get<ApiResponse<User>>('/auth/me');
  }

  // Users
  async getUser(username: string) {
    return this.client.get<ApiResponse<UserProfile>>(`/users/${username}`);
  }

  async updateProfile(data: Partial<User>) {
    return this.client.patch<ApiResponse<User>>('/users/me', data);
  }

  // Projects
  async listProjects(query?: ProjectListQuery) {
    const params = query ? Object.fromEntries(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== null),
    ) : {};
    return this.client.get<PaginatedResponse<Project>>('/projects?' + new URLSearchParams(params as Record<string, string>).toString());
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

  // Versions
  async listVersions(projectId: string) {
    return this.client.get<ApiResponse<ProjectVersion[]>>(`/projects/${projectId}/versions`);
  }

  async createVersion(projectId: string, data: Partial<ProjectVersion>) {
    return this.client.post<ApiResponse<ProjectVersion>>(`/projects/${projectId}/versions`, data);
  }

  // Categories
  async listCategories() {
    return this.client.get<ApiResponse<Category[]>>('/categories');
  }

  // Search
  async search(query: string, options?: { page?: number; limit?: number }) {
    return this.client.get<PaginatedResponse<Project>>(`/search?q=${encodeURIComponent(query)}&page=${options?.page || 1}&limit=${options?.limit || 20}`);
  }
}

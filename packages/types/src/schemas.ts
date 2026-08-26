import { z } from 'zod';
import { ProjectStatus, ProjectType } from './project';

/**
 * M-P: No zod schemas in @mcp/types - ApiClient.request casts <T> with no runtime validation.
 * Minimal schemas for the most-used query + entity shapes. More can be added incrementally.
 * These are pure runtime validators; they do not replace Prisma DTOs but give the SDK
 * a safe parse step: `ProjectListQuerySchema.parse(query)` before `buildProjectQuery`.
 */

export const ProjectListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
    cursor: z.string().nullable().optional(),
    search: z.string().max(200).optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
    author: z.string().optional(),
    category: z.string().optional(),
    loader: z.string().optional(),
    gameVersion: z.string().optional(),
    projectType: z.nativeEnum(ProjectType).optional(),
    license: z.string().optional(),
    categories: z.array(z.string()).optional(),
    loaders: z.array(z.string()).optional(),
    gameVersions: z.array(z.string()).optional(),
    projectTypes: z.array(z.nativeEnum(ProjectType)).optional(),
    licenses: z.array(z.string()).optional(),
    environments: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    tag: z.string().optional(),
  })
  .passthrough();

export const PaginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export type ValidatedProjectListQuery = z.infer<typeof ProjectListQuerySchema>;

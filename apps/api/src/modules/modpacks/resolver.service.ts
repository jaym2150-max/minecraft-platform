import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { VersionStatus } from '@prisma/client';
import { versionInRange, parseVersion, compareVersions } from './version-range';

export interface ResolveOptions {
  gameVersion?: string | null;
  loaderType?: string | null;
}

export type ConflictKind =
  'MISSING' | 'INCOMPATIBLE' | 'CYCLE' | 'LOADER_MISMATCH' | 'VERSION_MISMATCH';

export interface ResolutionConflict {
  kind: ConflictKind;
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

export interface ResolveResult {
  nodes: Record<string, ResolutionNode>;
  roots: string[];
  conflicts: ResolutionConflict[];
  score: number;
  resolvedCount: number;
}

const MAX_DEPTH = 20;
const MAX_NODES = 200;

/**
 * BFS dependency resolver with semver range, loader and game-version
 * awareness. Every required dependency is expanded; optional deps are
 * included but their absence is not a conflict. Incompatible rows are
 * surfaced as conflicts and never expanded.
 */
@Injectable()
export class ResolverService {
  private readonly logger = new Logger(ResolverService.name);
  constructor(private readonly prisma: PrismaService) {}

  async resolve(seeds: string[], opts: ResolveOptions = {}): Promise<ResolveResult> {
    const conflicts: ResolutionConflict[] = [];
    const nodes: Record<string, ResolutionNode> = {};
    const visited = new Set<string>();

    // resolve seed identifiers (slug or uuid) -> projectIds
    const seedProjects: Array<{ id: string; slug: string; title: string }> = [];
    for (const seed of seeds) {
      const p = await this.findProject(seed);
      if (!p) {
        conflicts.push({ kind: 'MISSING', message: `Seed "${seed}" not found`, dependentId: seed });
        continue;
      }
      seedProjects.push(p);
    }
    if (seedProjects.length === 0) {
      return { nodes, roots: [], conflicts, score: 0, resolvedCount: 0 };
    }

    const roots = seedProjects.map((p) => p.id);
    const queue: Array<{
      projectId: string;
      depth: number;
      parentId?: string;
      ancestors: string[];
    }> = seedProjects.map((p) => ({
      projectId: p.id,
      depth: 0,
      ancestors: [],
    }));

    while (queue.length > 0) {
      if (Object.keys(nodes).length >= MAX_NODES) {
        conflicts.push({
          kind: 'CYCLE',
          message: `Node limit ${MAX_NODES} reached — truncating`,
          dependentId: 'resolver',
        });
        break;
      }
      const cur = queue.shift()!;
      if (cur.depth > MAX_DEPTH) {
        conflicts.push({
          kind: 'CYCLE',
          message: `Max depth ${MAX_DEPTH} exceeded at ${cur.projectId}`,
          dependentId: cur.projectId,
        });
        continue;
      }
      if (cur.ancestors.includes(cur.projectId)) {
        conflicts.push({
          kind: 'CYCLE',
          message: `Cycle detected: ${cur.parentId} -> ${cur.projectId}`,
          dependentId: cur.parentId ?? cur.projectId,
          requiredId: cur.projectId,
        });
        continue;
      }
      if (visited.has(cur.projectId)) {
        continue;
      }
      visited.add(cur.projectId);

      const project = await this.prisma.project.findUnique({
        where: { id: cur.projectId },
        select: { id: true, slug: true, title: true, projectType: true },
      });
      if (!project) {
        conflicts.push({
          kind: 'MISSING',
          message: `Project ${cur.projectId} not found`,
          dependentId: cur.projectId,
        });
        continue;
      }

      const best = await this.pickBestVersion(project.id, opts);
      const node: ResolutionNode = {
        projectId: project.id,
        slug: project.slug,
        title: project.title,
        version: best?.version ?? null,
        versionId: best?.id ?? null,
        loaderType: opts.loaderType ?? null,
        gameVersion: opts.gameVersion ?? null,
        score: 0,
        children: [],
        depth: cur.depth,
      };

      // score: start 100, deductions below
      let score = 100;
      if (!best) {
        score -= 40;
        conflicts.push({
          kind: 'MISSING',
          message: `No approved version of "${project.slug}" matches loader=${opts.loaderType ?? 'any'} game=${opts.gameVersion ?? 'any'}`,
          dependentId: project.id,
        });
      }

      // fetch dependencies for the chosen version (or any version if none chosen)
      const deps = best
        ? await this.prisma.dependency.findMany({
            where: { dependentId: project.id, versionId: best.id },
          })
        : await this.prisma.dependency.findMany({ where: { dependentId: project.id } });

      for (const dep of deps as any[]) {
        const kind: string = dep.kind ?? (dep.isOptional ? 'OPTIONAL' : 'REQUIRED');
        if (kind === 'INCOMPATIBLE') {
          conflicts.push({
            kind: 'INCOMPATIBLE',
            message: `"${project.slug}" declares incompatibility with ${dep.requiredId}`,
            dependentId: project.id,
            requiredId: dep.requiredId,
            dependencyId: dep.id,
          });
          score -= 15;
          continue;
        }
        // loader constraint on the edge
        if (dep.loaderType && opts.loaderType && dep.loaderType !== opts.loaderType) {
          conflicts.push({
            kind: 'LOADER_MISMATCH',
            message: `Dependency ${dep.id} requires loader ${dep.loaderType} but pack uses ${opts.loaderType}`,
            dependentId: project.id,
            requiredId: dep.requiredId,
            dependencyId: dep.id,
          });
          score -= 10;
          continue;
        }
        // versionRange check — need to test target's candidate version
        if (dep.versionRange) {
          const targetBest = await this.pickBestVersion(dep.requiredId, opts);
          const targetVersion = targetBest?.version ?? null;
          if (!targetVersion || !versionInRange(targetVersion, dep.versionRange)) {
            const msg = `Version constraint "${dep.versionRange}" not satisfied by ${targetVersion ?? 'none'}`;
            if (kind === 'OPTIONAL') {
              // optional mismatch is not a hard conflict
              score -= 5;
            } else {
              conflicts.push({
                kind: 'VERSION_MISMATCH',
                message: msg,
                dependentId: project.id,
                requiredId: dep.requiredId,
                dependencyId: dep.id,
              });
              score -= 15;
            }
            if (kind === 'REQUIRED') continue; // don't expand missing
          }
        }

        // check target exists and has a matching version
        const targetExists = await this.prisma.project.findUnique({
          where: { id: dep.requiredId },
          select: { id: true },
        });
        if (!targetExists) {
          if (kind === 'REQUIRED') {
            conflicts.push({
              kind: 'MISSING',
              message: `Required project ${dep.requiredId} not found`,
              dependentId: project.id,
              requiredId: dep.requiredId,
              dependencyId: dep.id,
            });
            score -= 15;
          }
          continue;
        }
        const targetBest = await this.pickBestVersion(dep.requiredId, opts);
        if (!targetBest && kind === 'REQUIRED') {
          conflicts.push({
            kind: 'MISSING',
            message: `No matching version for required dep ${dep.requiredId}`,
            dependentId: project.id,
            requiredId: dep.requiredId,
            dependencyId: dep.id,
          });
          score -= 15;
          continue;
        }
        if (kind === 'OPTIONAL' && !targetBest) {
          // soft — skip
          continue;
        }
        node.children.push(dep.requiredId);
        if (cur.ancestors.includes(dep.requiredId) || dep.requiredId === project.id) {
          conflicts.push({
            kind: 'CYCLE',
            message: `Cycle: ${project.slug} -> ${dep.requiredId}`,
            dependentId: project.id,
            requiredId: dep.requiredId,
            dependencyId: dep.id,
          });
          score -= 10;
          continue;
        }
        if (!visited.has(dep.requiredId)) {
          queue.push({
            projectId: dep.requiredId,
            depth: cur.depth + 1,
            parentId: project.id,
            ancestors: [...cur.ancestors, cur.projectId],
          });
        }
      }

      node.score = Math.max(0, Math.min(100, score));
      nodes[project.id] = node;
    }

    const avg = Object.values(nodes).length
      ? Math.round(
          Object.values(nodes).reduce((a, n) => a + n.score, 0) / Object.values(nodes).length,
        )
      : 0;
    // persist compatibilityScore on roots (best-effort, don't fail resolve)
    for (const rid of roots) {
      const n = nodes[rid];
      if (!n) continue;
      this.prisma.project
        .update({ where: { id: rid }, data: { compatibilityScore: n.score } })
        .catch(() => {});
    }

    return { nodes, roots, conflicts, score: avg, resolvedCount: Object.keys(nodes).length };
  }

  private async findProject(seed: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seed);
    return this.prisma.project.findFirst({
      where: isUuid ? { OR: [{ id: seed }, { slug: seed }] } : { slug: seed },
      select: { id: true, slug: true, title: true },
    });
  }

  private async pickBestVersion(projectId: string, opts: ResolveOptions) {
    const versions = await this.prisma.projectVersion.findMany({
      where: { projectId, status: VersionStatus.APPROVED },
      include: { loaders: true },
      orderBy: { createdAt: 'desc' },
    });
    if (versions.length === 0) return null;
    let candidates = versions;
    if (opts.loaderType) {
      candidates = candidates.filter((v: any) =>
        v.loaders.some((l: any) => l.type === opts.loaderType),
      );
      if (candidates.length === 0) return null;
    }
    if (opts.gameVersion) {
      candidates = candidates.filter((v: any) =>
        v.loaders.some((l: any) => l.versionString === opts.gameVersion),
      );
      if (candidates.length === 0) return null;
    }
    // pick highest semver version string
    let best: any = candidates[0];
    let bestParsed = parseVersion(best.version);
    for (const c of candidates.slice(1)) {
      const p = parseVersion(c.version);
      if (!p || !bestParsed) continue;
      if (compareVersions(p, bestParsed) > 0) {
        best = c;
        bestParsed = p;
      }
    }
    return best;
  }
}

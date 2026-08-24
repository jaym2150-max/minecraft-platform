import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma, VersionStatus, ScanStatus, ProjectStatus, LoaderType } from '@prisma/client';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';
import { FollowsService } from '../projects/follows.service';
import { paginateCursor, CursorPage } from '../../common/pagination';
import * as crypto from 'crypto';

const VALID_HASH_ALGORITHMS = ['sha256', 'sha1', 'sha512'] as const;
type HashAlgorithm = typeof VALID_HASH_ALGORITHMS[number];

function algorithmToField(algo: HashAlgorithm): 'hash' | 'hashSha1' | 'hashSha512' {
  if (algo === 'sha1') return 'hashSha1';
  if (algo === 'sha512') return 'hashSha512';
  return 'hash';
}

@Injectable()
export class VersionsService {
  private readonly logger = new Logger(VersionsService.name);

  constructor(
    private prisma: PrismaService,
    private followsService: FollowsService,
    @InjectQueue('analytics') private analyticsQueue: Queue,
  ) {}

  async create(projectId: string, dto: CreateVersionDto): Promise<any> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project with id "${projectId}" not found`);
    }

    // The upload flow (POST /uploads) persisted a ProjectVersion stub keyed by
    // `version: uploadId` and queued it for malware scan. Bind the version
    // metadata to that stub rather than letting the client supply fileUrl/hash
    // (which would let a compromised author point downloads at attacker
    // content while reporting a benign hash).
    const uploadStub = await this.prisma.projectVersion.findUnique({
      where: { projectId_version: { projectId, version: dto.uploadId } },
      select: {
        id: true,
        version: true,
        fileUrl: true,
        fileSize: true,
        hash: true,
        scanStatus: true,
        loaders: { select: { type: true } },
      },
    });

    if (!uploadStub) {
      throw new NotFoundException(
        `Upload ${dto.uploadId} not found for project ${projectId}. Post the file via /uploads first.`,
      );
    }

    if (uploadStub.scanStatus !== ScanStatus.CLEAN) {
      throw new ConflictException(
        `Upload ${dto.uploadId} has not been cleared by the virus scanner (status=${uploadStub.scanStatus ?? 'unknown'}).`,
      );
    }

    // Reject the most obvious reuse collision: the same stub cannot be
    // promoted to a named version twice. (We additionally overwrite the
    // `version` column below, so a second call would also fail the unique
    // constraint — fail explicitly with a clearer message first.)
    if (uploadStub.version !== dto.uploadId) {
      throw new ConflictException(`Upload ${dto.uploadId} is already bound to a version`);
    }

    const existing = await this.prisma.projectVersion.findUnique({
      where: { projectId_version: { projectId, version: dto.version } },
    });
    if (existing && existing.id !== uploadStub.id) {
      throw new ConflictException(`Version "${dto.version}" already exists for this project`);
    }

    // If trying to create an APPROVED version, force it to SUBMITTED until
    // a moderator publishes. The scan already passed at upload time.
    const requestedStatus = dto.status ?? VersionStatus.DRAFT;
    const effectiveStatus =
      requestedStatus === VersionStatus.APPROVED ? VersionStatus.SUBMITTED : requestedStatus;

    // Replace any placeholder loaders the stub may have, then create the
    // final set from the DTO.
    await this.prisma.loader.deleteMany({ where: { versionId: uploadStub.id } });

    const version = await this.prisma.projectVersion.update({
      where: { id: uploadStub.id },
      data: {
        version: dto.version,
        changelog: dto.changelog,
        fileSize: dto.fileSize ?? uploadStub.fileSize,
        status: effectiveStatus,
        loaders: {
          create: dto.loaders.map((type) => ({
            type,
            projectId,
            versionString: dto.minecraftVersionId,
          })),
        },
        dependencies: dto.dependencies
          ? {
              create: dto.dependencies.map((dep) => ({
                requiredId: dep.projectId,
                dependentId: projectId,
                isRequired: dep.required,
                isOptional: !dep.required,
              })),
            }
          : undefined,
      },
      include: {
        loaders: true,
        dependencies: {
          include: {
            required: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    });

    // Notify followers about the new version
    if (dto.status === VersionStatus.APPROVED || version.status === VersionStatus.APPROVED) {
      this.followsService.notifyFollowers(projectId, dto.version).catch((err) =>
        this.logger.warn(`Failed to notify followers: ${err.message}`),
      );
    }

    return this.formatVersion(version);
  }

  async findAllByProject(projectId: string): Promise<any[]> {
    const project = await this.prisma.project.findFirst({
      where: { OR: [{ id: projectId }, { slug: projectId }] },
      select: { id: true },
    });
    if (!project) {
      throw new NotFoundException(`Project "${projectId}" not found`);
    }

    const versions = await this.prisma.projectVersion.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'desc' },
      include: {
        loaders: true,
        dependencies: {
          include: {
            required: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    });

    return versions.map((v) => this.formatVersion(v));
  }

  /**
   * Resolve a single version by its content hash. Supports sha256 (default),
   * sha1 and sha512 via the `algorithm` parameter. The indexed columns from
   * the latest migration (`hash`, `hashSha1`, `hashSha512`) keep this O(log n).
   */
  async getByHash(hash: string, algorithm: string = 'sha256'): Promise<any> {
    const algo = (VALID_HASH_ALGORITHMS as readonly string[]).includes(algorithm)
      ? (algorithm as HashAlgorithm)
      : 'sha256';
    const field = algorithmToField(algo);

    const version = await this.prisma.projectVersion.findFirst({
      where: { [field]: hash },
      include: {
        loaders: true,
        dependencies: {
          include: {
            required: { select: { id: true, title: true, slug: true } },
          },
        },
        project: { select: { id: true, title: true, slug: true } },
      },
    });
    if (!version) {
      throw new NotFoundException(`Version with ${algo} hash "${hash}" not found`);
    }
    return this.formatVersion(version);
  }

  /**
   * Given a content hash and optional loader / game-version filters, return
   * the most recent matching version. Modrinth parity — launcher integrators
   * call this to confirm a file is up-to-date.
   */
  async getLatestByHash(
    hash: string,
    loaders?: string[],
    gameVersions?: string[],
  ): Promise<any> {
    const baseMatch = await this.prisma.projectVersion.findFirst({
      where: { hash },
      include: {
        loaders: true,
        project: { select: { id: true, title: true, slug: true } },
      },
    });
    if (!baseMatch) {
      throw new NotFoundException(`Version with sha256 hash "${hash}" not found`);
    }

    const projectId = baseMatch.projectId;
    const versionsForProject = await this.prisma.projectVersion.findMany({
      where: {
        projectId,
        status: VersionStatus.APPROVED,
        ...(loaders?.length
          ? { loaders: { some: { type: { in: loaders as LoaderType[] } } } }
          : {}),
        ...(gameVersions?.length
          ? { loaders: { some: { versionString: { in: gameVersions } } } }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        loaders: true,
        project: { select: { id: true, title: true, slug: true } },
      },
    });

    const latest = versionsForProject[0] ?? baseMatch;
    return this.formatVersion(latest);
  }

  /**
   * Bulk version lookup by primary key. Missing ids are silently dropped to
   * match Modrinth/CurseForge behavior.
   */
  async findByIds(ids: string[]): Promise<any[]> {
    if (!ids.length) return [];
    const versions = await this.prisma.projectVersion.findMany({
      where: { id: { in: ids } },
      include: {
        loaders: true,
        project: { select: { id: true, title: true, slug: true } },
      },
    });
    return versions.map((v) => this.formatVersion(v));
  }

  /**
   * Bulk lookup keyed by content hash. Returns a map so callers can correlate
   * results back to their input list; missing hashes are simply absent.
   */
  async getBulkByHashes(
    hashes: string[],
    algorithm: string = 'sha256',
  ): Promise<Record<string, any>> {
    if (!hashes.length) return {};
    const algo = (VALID_HASH_ALGORITHMS as readonly string[]).includes(algorithm)
      ? (algorithm as HashAlgorithm)
      : 'sha256';
    const field = algorithmToField(algo);

    const versions = await this.prisma.projectVersion.findMany({
      where: { [field]: { in: hashes } },
      include: {
        loaders: true,
        project: { select: { id: true, title: true, slug: true } },
      },
    });

    const out: Record<string, any> = {};
    for (const v of versions) {
      const key = (v as any)[field] as string;
      if (key) out[key] = this.formatVersion(v);
    }
    return out;
  }

  /**
   * Cursor-based listing of versions for a project (newest first). Supports
   * Modrinth-style filtering by loader and/or game version:
   * `/projects/:slug/versions?loaders=FABRIC&gameVersions=1.20.1` returns
   * only the versions that expose a loader row matching BOTH the requested
   * loader type and game version (the standard ?l=&g= semantics).
   */
  async findAllByProjectCursor(
    projectId: string,
    options: { cursor?: string; limit?: number; loaders?: string[]; gameVersions?: string[] } = {},
  ): Promise<CursorPage<any>> {
    const project = await this.prisma.project.findFirst({
      where: { OR: [{ id: projectId }, { slug: projectId }] },
      select: { id: true },
    });
    if (!project) throw new NotFoundException(`Project "${projectId}" not found`);

    const where: Prisma.ProjectVersionWhereInput = { projectId: project.id };

    const loaderVals = (Object.values(LoaderType) as LoaderType[]).filter((l) =>
      (options.loaders ?? []).map((x) => x.toUpperCase()).includes(l),
    );
    const gameVersions = (options.gameVersions ?? []).filter(Boolean);

    const loadersSome: any = {};
    if (loaderVals.length) loadersSome.type = { in: loaderVals };
    if (gameVersions.length) loadersSome.versionString = { in: gameVersions };
    if (Object.keys(loadersSome).length) where.loaders = { some: loadersSome };

    return paginateCursor<any>({
      take: options.limit ?? 20,
      cursor: options.cursor,
      where,
      orderBy: { createdAt: 'desc' },
      prismaDelegate: {
        findMany: (args) => this.prisma.projectVersion.findMany({
          ...(args as any),
          include: {
            loaders: true,
            project: { select: { id: true, title: true, slug: true } },
          },
        }),
      },
    }).then((page) => ({
      ...page,
      data: page.data.map((v) => this.formatVersion(v)),
    }));
  }

  /**
   * Fetch a single version by id. Anonymous callers only see versions
   * whose project is PUBLISHED and whose own status is APPROVED + CLEAN —
   * otherwise a guessed id leaks metadata (changelog, fileUrl, hash,
   * loaders, dependencies) for INFECTED / DRAFT / REJECTED versions. Authenticated
   * authors/admins (passed via `viewer`) bypass the gate so they can preview
   * their own drafts from the dashboard.
   */
  async findOne(
    id: string,
    viewer: { id?: string; role?: string } | null = null,
  ): Promise<any> {
    const version = await this.prisma.projectVersion.findUnique({
      where: { id },
      include: {
        loaders: true,
        dependencies: {
          include: {
            required: { select: { id: true, title: true, slug: true } },
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            authorId: true,
          },
        },
      },
    });

    if (!version) {
      throw new NotFoundException(`Version with id "${id}" not found`);
    }

    // Gate anonymous access to fully published + clean versions. Throw the
    // same NotFound as above so an unauth caller cannot distinguish "version
    // does not exist" from "version exists but is not public" — closing the
    // existence-leak oracle.
    if (!viewer || (!viewer.role?.includes('ADMIN') && !viewer.role?.includes('OWNER'))) {
      const downloadable =
        version.status === VersionStatus.APPROVED &&
        version.scanStatus === ScanStatus.CLEAN &&
        version.project?.status === ProjectStatus.PUBLISHED;
      const isAuthor = viewer?.id && viewer.id === version.project?.authorId;
      if (!downloadable && !isAuthor) {
        throw new NotFoundException(`Version with id "${id}" not found`);
      }
    }

    return this.formatVersion(version);
  }

  async update(id: string, dto: UpdateVersionDto): Promise<any> {
    const existing = await this.prisma.projectVersion.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Version with id "${id}" not found`);
    }

    const updateData: Prisma.ProjectVersionUpdateInput = {};
    if (dto.version !== undefined) updateData.version = dto.version;
    if (dto.changelog !== undefined) updateData.changelog = dto.changelog;
    // fileUrl/hash are server-managed and bound at upload time; clients
    // must not be able to rewrite a CLEAN-verified version's storage URL
    // post-approval (would defeat the malware scan gate).
    if (dto.fileSize !== undefined) updateData.fileSize = dto.fileSize;
    if (dto.status !== undefined) updateData.status = dto.status;

    const version = await this.prisma.projectVersion.update({
      where: { id },
      data: updateData,
      include: {
        loaders: true,
        dependencies: {
          include: {
            required: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    });

    return this.formatVersion(version);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.projectVersion.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Version with id "${id}" not found`);
    }

    await this.prisma.$transaction([
      this.prisma.loader.deleteMany({ where: { versionId: id } }),
      this.prisma.dependency.deleteMany({ where: { versionId: id } }),
      this.prisma.download.deleteMany({ where: { versionId: id } }),
      this.prisma.projectVersion.delete({ where: { id } }),
    ]);
  }

  async incrementDownloads(id: string, ip?: string, userAgent?: string, userId?: string): Promise<{ fileUrl: string; hash: string; projectId: string }> {
    const version = await this.prisma.projectVersion.findUnique({
      where: { id },
      select: {
        id: true,
        fileUrl: true,
        hash: true,
        projectId: true,
        status: true,
        scanStatus: true,
        project: { select: { status: true } },
      },
    });

    if (!version) {
      throw new NotFoundException(`Version with id "${id}" not found`);
    }

    const isDownloadable =
      version.status === VersionStatus.APPROVED &&
      version.scanStatus === ScanStatus.CLEAN &&
      version.project?.status === ProjectStatus.PUBLISHED;

    if (!isDownloadable) {
      // 404 (not 403) to avoid leaking the existence of unpublished or
      // not-yet-scanned-clean versions to anonymous callers.
      throw new NotFoundException(`Version with id "${id}" not found`);
    }

    const hashedIp = ip ? crypto.createHash('sha256').update(ip).digest('hex') : null;

    // Resolve the project author for the creator-points accrual (outside the
    // transaction: a missed credit must never block or fail a download).
    const projectAuthor = await this.prisma.project.findUnique({
      where: { id: version.projectId },
      select: { authorId: true },
    });

    const ops: [
      Prisma.PrismaPromise<{ downloads: number }>,
      Prisma.PrismaPromise<{ downloads: number }>,
      Prisma.PrismaPromise<{ id: string }>,
    ] = [
      this.prisma.projectVersion.update({
        where: { id },
        data: { downloads: { increment: 1 } },
      }),
      this.prisma.project.update({
        where: { id: version.projectId },
        data: { downloads: { increment: 1 } },
      }),
      this.prisma.download.create({
        data: {
          projectId: version.projectId,
          versionId: id,
          ip: hashedIp,
          userAgent,
          userId,
        },
      }),
    ];

    const [, , download] = await this.prisma.$transaction(ops);

    // Creator points accrual — fire-and-forget so payout accounting can never
    // degrade the download path. Idempotent via the unique downloadId.
    if (projectAuthor?.authorId && download?.id) {
      const REWARD_POINTS_PER_DOWNLOAD = 10;
      this.prisma.earningLedger
        .create({
          data: {
            userId: projectAuthor.authorId,
            amountPoints: REWARD_POINTS_PER_DOWNLOAD,
            projectId: version.projectId,
            downloadId: download.id,
          },
        })
        .catch((err) => this.logger.warn(`Earning accrual failed: ${err.message}`));
    }

    this.analyticsQueue.add('download', { projectId: version.projectId, versionId: id, userId }).catch((err) =>
      this.logger.warn(`Failed to enqueue analytics: ${err.message}`),
    );

    return { fileUrl: version.fileUrl, hash: version.hash, projectId: version.projectId };
  }

  static generateFileHash(buffer: Buffer): string {
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    return `sha256:${hash}`;
  }

  private formatVersion(version: any): any {
    const minecraftVersion = version.loaders?.[0]?.versionString ?? '';
    return {
      id: version.id,
      version: version.version,
      changelog: version.changelog ?? undefined,
      fileUrl: version.fileUrl,
      fileSize: version.fileSize,
      hash: version.hash,
      downloads: version.downloads,
      status: version.status,
      scanStatus: version.scanStatus,
      projectId: version.projectId,
      minecraftVersion,
      createdAt: version.createdAt instanceof Date ? version.createdAt.toISOString() : version.createdAt,
      updatedAt: version.updatedAt instanceof Date ? version.updatedAt.toISOString() : version.updatedAt,
      loaders: version.loaders?.map((l: any) => l.type) ?? [],
      dependencies: version.dependencies?.map((d: any) => ({
        id: d.required.id,
        name: d.required.title,
        slug: d.required.slug,
        required: d.isRequired ?? !d.isOptional,
      })) ?? [],
      project: version.project,
    };
  }
}

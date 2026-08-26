import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SyncJobsService } from './sync-jobs.service';
import type { ProviderSyncJobData } from './integrations.processor';

class TriggerSyncDto {
  @IsIn(['FULL_IMPORT', 'INCREMENTAL', 'STATS_REFRESH'])
  type!: 'FULL_IMPORT' | 'INCREMENTAL' | 'STATS_REFRESH';

  @IsOptional()
  @IsString()
  providerSlug?: string;

  /** FULL_IMPORT only: per-type project cap. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limitPerType?: number;
}

/**
 * Admin endpoints for external provider integrations and their sync runs.
 * Replaces the legacy one-shot `admin/integrations/modrinth/sync` endpoint
 * with a provider-agnostic surface backed by persisted SyncJob/SyncLog rows.
 */
@Controller('admin/integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'OWNER')
export class IntegrationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly syncJobs: SyncJobsService,
    @InjectQueue('provider-sync') private readonly syncQueue: Queue,
  ) {}

  /** Providers with linked-project counts and their latest sync run. */
  @Get('providers')
  async listProviders() {
    const providers = await this.prisma.provider.findMany({ orderBy: { createdAt: 'asc' } });
    const data = await Promise.all(
      providers.map(async (p) => {
        const [linkedProjects, lastSync] = await Promise.all([
          this.prisma.providerProject.count({ where: { providerId: p.id } }),
          this.prisma.syncJob.findFirst({
            where: { providerId: p.id },
            orderBy: { createdAt: 'desc' },
          }),
        ]);
        const running = await this.prisma.syncJob.count({
          where: { providerId: p.id, status: { in: ['PENDING', 'RUNNING'] as any } },
        });
        return { ...p, linkedProjects, lastSync, syncInProgress: running > 0 };
      }),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Provider integrations',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /** Queue a provider sync run (single-flight: one sync at a time). */
  @Post('sync')
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerSync(@Body() dto: TriggerSyncDto) {
    const inFlight = await this.syncQueue.getJobs(['active', 'waiting', 'delayed']);
    if (inFlight.length > 0) {
      throw new ConflictException('A provider sync is already in progress');
    }

    const jobData: ProviderSyncJobData = {
      type: dto.type,
      providerSlug: dto.providerSlug ?? 'modrinth',
      trigger: 'MANUAL',
      limitPerType: dto.limitPerType,
    };
    const job = await this.syncQueue.add('sync', jobData, {
      attempts: 1,
      removeOnComplete: { age: 604800 },
      removeOnFail: { age: 604800 },
    });

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: `${dto.type} sync queued`,
      data: { queueJobId: job.id, type: dto.type },
      timestamp: new Date().toISOString(),
    };
  }

  /** Sync run history (newest first). */
  @Get('syncs')
  async listSyncs(@Query('providerId') providerId?: string, @Query('limit') limit?: string) {
    const take = limit ? Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100) : 20;
    const jobs = await this.syncJobs.list(providerId || undefined, take);
    return {
      statusCode: HttpStatus.OK,
      message: 'Sync run history',
      data: jobs,
      timestamp: new Date().toISOString(),
    };
  }

  /** One sync run with counters and structured logs. */
  @Get('syncs/:id')
  async getSync(@Param('id') id: string) {
    const job = await this.syncJobs.get(id);
    if (!job) {
      throw new NotFoundException(`Sync job "${id}" not found`);
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Sync run detail',
      data: job,
      timestamp: new Date().toISOString(),
    };
  }

  /** On-demand resync of one project (all upstream versions). */
  @Post('projects/:slug/sync')
  @HttpCode(HttpStatus.ACCEPTED)
  async syncProject(@Param('slug') slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      select: { id: true, slug: true },
    });
    if (!project) {
      throw new NotFoundException(`Project "${slug}" not found`);
    }
    const inFlight = await this.syncQueue.getJobs(['active', 'waiting', 'delayed']);
    if (inFlight.length > 0) {
      throw new ConflictException('A provider sync is already in progress');
    }

    const jobData: ProviderSyncJobData = {
      type: 'SINGLE_PROJECT',
      providerSlug: 'modrinth',
      trigger: 'MANUAL',
      projectSlug: project.slug,
    };
    const job = await this.syncQueue.add('sync', jobData, {
      attempts: 1,
      removeOnComplete: { age: 604800 },
      removeOnFail: { age: 604800 },
    });

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: `Single-project sync queued for "${slug}"`,
      data: { queueJobId: job.id, type: 'SINGLE_PROJECT' },
      timestamp: new Date().toISOString(),
    };
  }
}

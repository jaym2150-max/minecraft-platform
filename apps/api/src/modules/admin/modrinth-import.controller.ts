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
  UseGuards,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

class SyncDto {
  /** Optional per-type cap. Omit to import the full default plan (~62 projects). */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limitPerType?: number;
}

/**
 * Admin-only trigger for the Modrinth catalog importer. The full plan pulls
 * ~62 projects with their version histories, so the sync runs as a BullMQ job
 * (processed in-process by ModrinthImportProcessor) and this endpoint returns
 * immediately with the job id. Poll GET .../sync/:jobId for state/progress.
 */
@Controller('admin/integrations/modrinth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'OWNER')
export class ModrinthImportController {
  constructor(@InjectQueue('modrinth-import') private readonly importQueue: Queue) {}

  @Post('sync')
  @HttpCode(HttpStatus.ACCEPTED)
  async sync(@Body() dto: SyncDto) {
    // Single-flight guard: only one import may run at a time.
    const inFlight = await this.importQueue.getJobs(['active', 'waiting', 'delayed']);
    if (inFlight.length > 0) {
      throw new ConflictException('A Modrinth import is already in progress');
    }

    const job = await this.importQueue.add(
      'sync',
      { limitPerType: dto.limitPerType },
      {
        attempts: 1,
        removeOnComplete: { age: 604800 },
        removeOnFail: { age: 604800 },
      },
    );

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Modrinth import queued',
      data: { jobId: job.id },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('sync/:jobId')
  async syncStatus(@Param('jobId') jobId: string) {
    const job = await this.importQueue.getJob(jobId);
    if (!job) {
      throw new NotFoundException(`Import job "${jobId}" not found (it may have been cleaned up)`);
    }
    const state = await job.getState();
    return {
      statusCode: HttpStatus.OK,
      message: 'Modrinth import status',
      data: {
        jobId: job.id,
        state,
        failedReason: job.failedReason ?? undefined,
        finishedOn: job.finishedOn ?? undefined,
        result: state === 'completed' ? job.returnvalue : undefined,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

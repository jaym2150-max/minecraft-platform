import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { ModrinthImportService } from './modrinth-importer.service';

interface ModrinthImportJobData {
  limitPerType?: number;
}

/**
 * In-process worker for the Modrinth catalog import. Runs on the
 * `modrinth-import` BullMQ queue so the HTTP POST returns immediately with a
 * job id instead of holding a request open for minutes (which would time out
 * behind any sane reverse-proxy read timeout).
 */
@Processor('modrinth-import')
export class ModrinthImportProcessor extends WorkerHost {
  private readonly logger = new Logger(ModrinthImportProcessor.name);

  constructor(private readonly importer: ModrinthImportService) {
    super();
  }

  async process(job: Job<ModrinthImportJobData>): Promise<unknown> {
    this.logger.log(
      `Modrinth import started (job ${job.id}, limitPerType=${job.data?.limitPerType ?? 'full plan'})`,
    );
    const result = await this.importer.sync(job.data?.limitPerType);
    this.logger.log(
      `Modrinth import finished (job ${job.id}): ${result.imported} projects in ${result.elapsedMs}ms`,
    );
    return { ...result, jobId: job.id, completedAt: new Date().toISOString() };
  }
}

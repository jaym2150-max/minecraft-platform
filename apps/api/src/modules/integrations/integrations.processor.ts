import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { ModrinthSyncService } from './modrinth-sync.service';
import { SyncJobsService } from './sync-jobs.service';

export interface ProviderSyncJobData {
  type: 'FULL_IMPORT' | 'INCREMENTAL' | 'STATS_REFRESH' | 'SINGLE_PROJECT';
  providerSlug?: string;
  trigger?: 'MANUAL' | 'SCHEDULED';
  limitPerType?: number;
  projectSlug?: string;
}

/**
 * In-process worker for provider synchronization. Runs on the
 * `provider-sync` queue so HTTP triggers (and the cron schedulers) return
 * immediately instead of holding requests open for minutes. Every run gets a
 * SyncJob row; on failure the job is marked FAILED with partial counters.
 */
@Processor('provider-sync')
export class IntegrationsProcessor extends WorkerHost {
  private readonly logger = new Logger(IntegrationsProcessor.name);

  constructor(
    private readonly sync: ModrinthSyncService,
    private readonly syncJobs: SyncJobsService,
  ) {
    super();
  }

  async process(job: Job<ProviderSyncJobData>): Promise<unknown> {
    const { type, trigger = 'MANUAL', limitPerType, projectSlug } = job.data;
    const provider = await this.sync.getOrInitProvider();
    const syncJob = await this.syncJobs.create(provider.id, type, trigger);
    await this.syncJobs.markRunning(syncJob.id);
    this.logger.log(`provider-sync queue job ${job.id}: ${type} (sync job ${syncJob.id})`);

    try {
      let counters;
      switch (type) {
        case 'FULL_IMPORT':
          counters = await this.sync.runFullImport(syncJob.id, { limitPerType });
          break;
        case 'INCREMENTAL':
          counters = await this.sync.runIncremental(syncJob.id);
          break;
        case 'STATS_REFRESH':
          counters = await this.sync.runStatsRefresh(syncJob.id);
          break;
        case 'SINGLE_PROJECT':
          if (!projectSlug) throw new Error('SINGLE_PROJECT sync requires projectSlug');
          counters = await this.sync.runSingleProject(syncJob.id, projectSlug);
          break;
        default:
          throw new Error(`Unknown sync type: ${type}`);
      }

      const message = `${counters.created} created, ${counters.updated} updated, ${counters.error} errors (${counters.processed} processed)`;
      await this.syncJobs.log(syncJob.id, 'INFO', message);
      await this.syncJobs.finish(syncJob.id, 'COMPLETED', message, counters);
      this.logger.log(`provider-sync ${type} finished: ${message}`);
      return { syncJobId: syncJob.id, ...counters };
    } catch (err: any) {
      const message = err?.message ?? String(err);
      await this.syncJobs.log(syncJob.id, 'ERROR', message);
      await this.syncJobs.finish(syncJob.id, 'FAILED', message);
      this.logger.error(`provider-sync ${type} failed: ${message}`);
      throw err;
    }
  }
}

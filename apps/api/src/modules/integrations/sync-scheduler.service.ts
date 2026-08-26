import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Queue } from 'bullmq';
import type { ProviderSyncJobData } from './integrations.processor';

const SYNC_JOB_OPTS = {
  attempts: 1, // never double-run a sync on transient failures
  removeOnComplete: { age: 604800 },
  removeOnFail: { age: 604800 },
};

/**
 * Registers the scheduled provider syncs as BullMQ job schedulers:
 *  - INCREMENTAL  hourly at :00 (new/updated upstream projects)
 *  - STATS_REFRESH daily at 04:30 UTC (download/metadata refresh)
 *
 * upsertJobScheduler is idempotent, so restarting the API simply re-asserts
 * the schedules. Set SYNC_SCHEDULER_DISABLED=true to run without cron (e.g.
 * local dev against a shared Redis).
 */
@Injectable()
export class SyncSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SyncSchedulerService.name);

  constructor(
    @InjectQueue('provider-sync') private readonly syncQueue: Queue,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    if (this.config.get('SYNC_SCHEDULER_DISABLED') === 'true') {
      this.logger.warn('Sync schedulers disabled via SYNC_SCHEDULER_DISABLED=true');
      return;
    }
    try {
      const incremental: ProviderSyncJobData = {
        type: 'INCREMENTAL',
        providerSlug: 'modrinth',
        trigger: 'SCHEDULED',
      };
      const statsRefresh: ProviderSyncJobData = {
        type: 'STATS_REFRESH',
        providerSlug: 'modrinth',
        trigger: 'SCHEDULED',
      };
      await this.syncQueue.upsertJobScheduler(
        'incremental-sync',
        { pattern: '0 * * * *' },
        {
          name: 'sync',
          data: incremental,
          opts: SYNC_JOB_OPTS,
        },
      );
      await this.syncQueue.upsertJobScheduler(
        'daily-stats-refresh',
        { pattern: '30 4 * * *' },
        {
          name: 'sync',
          data: statsRefresh,
          opts: SYNC_JOB_OPTS,
        },
      );
      this.logger.log(
        'Sync schedulers registered (hourly incremental, daily stats refresh at 04:30 UTC)',
      );
    } catch (err: any) {
      // Redis being unreachable at boot must not crash the API — manual and
      // single-project syncs keep working and the schedulers re-register on
      // next start.
      this.logger.warn(`Could not register sync schedulers: ${err?.message}`);
    }
  }
}

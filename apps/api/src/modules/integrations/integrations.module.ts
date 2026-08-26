import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsProcessor } from './integrations.processor';
import { ModrinthProvider } from './modrinth.provider';
import { ModrinthSyncService } from './modrinth-sync.service';
import { SyncJobsService } from './sync-jobs.service';
import { SyncSchedulerService } from './sync-scheduler.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'provider-sync',
      defaultJobOptions: {
        attempts: 1,
        removeOnComplete: { age: 604800 },
        removeOnFail: { age: 604800 },
      },
    }),
    BullModule.registerQueue({
      name: 'virus-scan',
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    }),
  ],
  controllers: [IntegrationsController],
  providers: [
    ModrinthProvider,
    SyncJobsService,
    ModrinthSyncService,
    IntegrationsProcessor,
    SyncSchedulerService,
  ],
})
export class IntegrationsModule {}

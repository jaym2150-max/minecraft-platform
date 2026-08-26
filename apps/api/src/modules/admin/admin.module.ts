import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ModrinthImportController } from './modrinth-import.controller';
import { ModrinthImportService } from './modrinth-importer.service';
import { ModrinthImportProcessor } from './modrinth-import.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'virus-scan',
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
        },
      },
      { name: 'modrinth-import' },
    ),
  ],
  controllers: [AdminController, ModrinthImportController],
  providers: [AdminService, ModrinthImportService, ModrinthImportProcessor],
})
export class AdminModule {}

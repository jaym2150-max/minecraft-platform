import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ModrinthImportController } from './modrinth-import.controller';
import { ModrinthImportService } from './modrinth-importer.service';
@Module({
  controllers: [AdminController, ModrinthImportController],
  providers: [AdminService, ModrinthImportService],
})
export class AdminModule {}

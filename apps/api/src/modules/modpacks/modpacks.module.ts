import { Module } from '@nestjs/common';
import { ModpacksController } from './modpacks.controller';
import { ModpacksService } from './modpacks.service';
import { ResolverService } from './resolver.service';
import { ModpackImportController } from './import.controller';
import { ModpackImportService } from './import.service';

@Module({
  controllers: [ModpacksController, ModpackImportController],
  providers: [ModpacksService, ResolverService, ModpackImportService],
  exports: [ModpacksService, ResolverService, ModpackImportService],
})
export class ModpacksModule {}

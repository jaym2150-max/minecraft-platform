import { Module } from '@nestjs/common';
import { ModpacksController } from './modpacks.controller';
import { ModpacksService } from './modpacks.service';

@Module({
  controllers: [ModpacksController],
  providers: [ModpacksService],
  exports: [ModpacksService],
})
export class ModpacksModule {}

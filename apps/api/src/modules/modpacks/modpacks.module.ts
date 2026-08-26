import { Module } from '@nestjs/common';
import { ModpacksController } from './modpacks.controller';
import { ModpacksService } from './modpacks.service';
import { ResolverService } from './resolver.service';

@Module({
  controllers: [ModpacksController],
  providers: [ModpacksService, ResolverService],
  exports: [ModpacksService, ResolverService],
})
export class ModpacksModule {}

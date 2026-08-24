import { Module } from '@nestjs/common';
import { MinecraftVersionsController } from './minecraft-versions.controller';
import { MinecraftVersionsService } from './minecraft-versions.service';

@Module({
  controllers: [MinecraftVersionsController],
  providers: [MinecraftVersionsService],
  exports: [MinecraftVersionsService],
})
export class MinecraftVersionsModule {}

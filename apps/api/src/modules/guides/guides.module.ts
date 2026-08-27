import { Module } from '@nestjs/common';
import { GuidesController } from './guides.controller';
import { GuidesService } from './guides.service';
import { InstallGuidesController } from './install-guides.controller';
import { InstallGuidesService } from './install-guides.service';

@Module({
  controllers: [GuidesController, InstallGuidesController],
  providers: [GuidesService, InstallGuidesService],
  exports: [GuidesService, InstallGuidesService],
})
export class GuidesModule {}

import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { VersionsController, VersionByIdController } from './versions.controller';
import { VersionFilesController, VersionsHashCompatController } from './version-files.controller';
import { VersionsService } from './versions.service';
import { ProjectsModule } from '../projects/projects.module';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    ProjectsModule,
    PrismaModule,
    forwardRef(() => FilesModule),
    BullModule.registerQueue({ name: 'analytics' }),
  ],
  controllers: [
    VersionsController,
    VersionByIdController,
    VersionFilesController,
    VersionsHashCompatController,
  ],
  providers: [VersionsService],
  exports: [VersionsService],
})
export class VersionsModule {}

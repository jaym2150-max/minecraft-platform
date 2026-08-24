import { Module, forwardRef } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { VersionsModule } from '../versions/versions.module';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule, forwardRef(() => VersionsModule)],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}

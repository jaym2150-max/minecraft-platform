import { Module } from '@nestjs/common';
import { DependenciesController } from './dependencies.controller';
import { DependenciesService } from './dependencies.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DependenciesController],
  providers: [DependenciesService],
  exports: [DependenciesService],
})
export class DependenciesModule {}

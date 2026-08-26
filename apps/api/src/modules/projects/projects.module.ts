import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { RecommendationsService } from './recommendations.service';
import { FollowsService } from './follows.service';
import { DependenciesModule } from '../dependencies/dependencies.module';
import { TeamsModule } from '../teams/teams.module';

@Module({
  imports: [
    DependenciesModule,
    TeamsModule,
    BullModule.registerQueue({ name: 'analytics' }),
    BullModule.registerQueue({ name: 'search-index' }),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, FollowsService, RecommendationsService],
  exports: [ProjectsService, FollowsService, RecommendationsService],
})
export class ProjectsModule {}

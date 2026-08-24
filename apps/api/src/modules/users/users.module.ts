import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ProjectsModule } from '../projects/projects.module';
import { UserFollowsService } from './user-follows.service';
import { ReviewsModule } from '../reviews/reviews.module';
import { CommentsModule } from '../comments/comments.module';
import { VersionsModule } from '../versions/versions.module';

@Module({
  imports: [
    PrismaModule,
    ProjectsModule,
    ReviewsModule,
    CommentsModule,
    VersionsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserFollowsService],
  exports: [UsersService, UserFollowsService],
})
export class UsersModule {}

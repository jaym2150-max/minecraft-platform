import { Module, NestModule, MiddlewareConsumer, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { BullModule } from '@nestjs/bullmq';import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER, Reflector } from '@nestjs/core';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { VersionsModule } from './modules/versions/versions.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { CommentsModule } from './modules/comments/comments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SearchModule } from './modules/search/search.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { ApiKeysService } from './modules/api-keys/api-keys.service';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { FilesModule } from './modules/files/files.module';
import { DependenciesModule } from './modules/dependencies/dependencies.module';
import { TeamsModule } from './modules/teams/teams.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { LoadersModule } from './modules/loaders/loaders.module';
import { MinecraftVersionsModule } from './modules/minecraft-versions/minecraft-versions.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';
import { BillingModule } from './modules/billing/billing.module';
import { LicensesModule } from './modules/licenses/licenses.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { ThreadsModule } from './modules/threads/threads.module';
import { ModpacksModule } from './modules/modpacks/modpacks.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import storageConfig from './config/storage.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig, databaseConfig, redisConfig, storageConfig] }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [{ ttl: config.get('RATE_LIMIT_TTL', 60), limit: config.get('RATE_LIMIT_MAX', 100) }],
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: parseInt(config.get('REDIS_PORT', '6379'), 10),
          password: config.get('REDIS_PASSWORD'),
          maxRetriesPerRequest: null,
        },
        // H-W1: global default job options applied to EVERY queue registered
        // below (`analytics`, `image-process`, `search-index`, `notifications`,
        // `virus-scan`). Without these, completed/failed jobs pile up in Redis
        // forever and a transient downstream failure kills a job permanently.
        // Per-queue `.add()` calls can still override any of these, and the
        // virus-scanner's `attempts: 5` is intentionally more aggressive; the
        // values below are the safe baseline that every background job gets.
        defaultJobOptions: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: { age: 3600, count: 5000 },
          removeOnFail: { age: 14400, count: 20000 },
        },
      }),
    }),
    // All queue names referenced anywhere in the app must be registered
    // globally here, otherwise `@InjectQueue('x')` throws at boot time.
    BullModule.registerQueue(
      { name: 'analytics' },
      { name: 'image-process' },
      { name: 'search-index' },
      { name: 'notifications' },
      { name: 'virus-scan' },
      { name: 'uploads' },
    ),
    PrismaModule, AuthModule, UsersModule, ApiKeysModule, ProjectsModule, VersionsModule, UploadsModule, FilesModule,
    CommentsModule, ReviewsModule, ModerationModule, AnalyticsModule,     SearchModule, AdminModule, HealthModule, CollectionsModule, GalleryModule,
    NotificationsModule, DependenciesModule, TeamsModule, CategoriesModule,
    LoadersModule, MinecraftVersionsModule, BillingModule,
    LicensesModule, StatisticsModule, ThreadsModule, ModpacksModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerBehindProxyGuard },
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector, apiKeysService: ApiKeysService) => new JwtAuthGuard(reflector, apiKeysService),
      inject: [Reflector, ApiKeysService],
    },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

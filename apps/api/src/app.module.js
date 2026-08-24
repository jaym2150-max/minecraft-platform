"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var throttler_1 = require("@nestjs/throttler");
var throttler_behind_proxy_guard_1 = require("./common/guards/throttler-behind-proxy.guard");
var jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
var bullmq_1 = require("@nestjs/bullmq");
var core_1 = require("@nestjs/core");
var prisma_module_1 = require("./common/prisma/prisma.module");
var auth_module_1 = require("./modules/auth/auth.module");
var users_module_1 = require("./modules/users/users.module");
var projects_module_1 = require("./modules/projects/projects.module");
var versions_module_1 = require("./modules/versions/versions.module");
var uploads_module_1 = require("./modules/uploads/uploads.module");
var comments_module_1 = require("./modules/comments/comments.module");
var reviews_module_1 = require("./modules/reviews/reviews.module");
var moderation_module_1 = require("./modules/moderation/moderation.module");
var analytics_module_1 = require("./modules/analytics/analytics.module");
var search_module_1 = require("./modules/search/search.module");
var api_keys_module_1 = require("./modules/api-keys/api-keys.module");
var api_keys_service_1 = require("./modules/api-keys/api-keys.service");
var notifications_module_1 = require("./modules/notifications/notifications.module");
var collections_module_1 = require("./modules/collections/collections.module");
var gallery_module_1 = require("./modules/gallery/gallery.module");
var files_module_1 = require("./modules/files/files.module");
var dependencies_module_1 = require("./modules/dependencies/dependencies.module");
var teams_module_1 = require("./modules/teams/teams.module");
var categories_module_1 = require("./modules/categories/categories.module");
var loaders_module_1 = require("./modules/loaders/loaders.module");
var minecraft_versions_module_1 = require("./modules/minecraft-versions/minecraft-versions.module");
var logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
var transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
var logger_middleware_1 = require("./common/middleware/logger.middleware");
var http_exception_filter_1 = require("./common/filters/http-exception.filter");
var admin_module_1 = require("./modules/admin/admin.module");
var health_module_1 = require("./modules/health/health.module");
var billing_module_1 = require("./modules/billing/billing.module");
var licenses_module_1 = require("./modules/licenses/licenses.module");
var statistics_module_1 = require("./modules/statistics/statistics.module");
var threads_module_1 = require("./modules/threads/threads.module");
var app_config_1 = require("./config/app.config");
var database_config_1 = require("./config/database.config");
var redis_config_1 = require("./config/redis.config");
var storage_config_1 = require("./config/storage.config");
var AppModule = function () {
    var _classDecorators = [(0, common_1.Module)({
            imports: [
                config_1.ConfigModule.forRoot({ isGlobal: true, load: [app_config_1.default, database_config_1.default, redis_config_1.default, storage_config_1.default] }),
                throttler_1.ThrottlerModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: function (config) { return ({
                        throttlers: [{ ttl: config.get('RATE_LIMIT_TTL', 60), limit: config.get('RATE_LIMIT_MAX', 100) }],
                    }); },
                }),
                bullmq_1.BullModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: function (config) { return ({
                        connection: {
                            host: config.get('REDIS_HOST', 'localhost'),
                            port: parseInt(config.get('REDIS_PORT', '6379'), 10),
                            password: config.get('REDIS_PASSWORD'),
                            maxRetriesPerRequest: null,
                        },
                    }); },
                }),
                // All queue names referenced anywhere in the app must be registered
                // globally here, otherwise `@InjectQueue('x')` throws at boot time.
                bullmq_1.BullModule.registerQueue({ name: 'analytics' }, { name: 'image-process' }, { name: 'search-index' }, { name: 'notifications' }, { name: 'uploads' }, { name: 'virus-scan' }),
                prisma_module_1.PrismaModule, auth_module_1.AuthModule, users_module_1.UsersModule, api_keys_module_1.ApiKeysModule, projects_module_1.ProjectsModule, versions_module_1.VersionsModule, uploads_module_1.UploadsModule, files_module_1.FilesModule,
                comments_module_1.CommentsModule, reviews_module_1.ReviewsModule, moderation_module_1.ModerationModule, analytics_module_1.AnalyticsModule, search_module_1.SearchModule, admin_module_1.AdminModule, health_module_1.HealthModule, collections_module_1.CollectionsModule, gallery_module_1.GalleryModule,
                notifications_module_1.NotificationsModule, dependencies_module_1.DependenciesModule, teams_module_1.TeamsModule, categories_module_1.CategoriesModule,
                loaders_module_1.LoadersModule, minecraft_versions_module_1.MinecraftVersionsModule, billing_module_1.BillingModule,
                licenses_module_1.LicensesModule, statistics_module_1.StatisticsModule, threads_module_1.ThreadsModule,
            ],
            providers: [
                { provide: core_1.APP_GUARD, useClass: throttler_behind_proxy_guard_1.ThrottlerBehindProxyGuard },
                {
                    provide: core_1.APP_GUARD,
                    useFactory: function (reflector, apiKeysService) { return new jwt_auth_guard_1.JwtAuthGuard(reflector, apiKeysService); },
                    inject: [core_1.Reflector, api_keys_service_1.ApiKeysService],
                },
                { provide: core_1.APP_INTERCEPTOR, useClass: logging_interceptor_1.LoggingInterceptor },
                { provide: core_1.APP_INTERCEPTOR, useClass: transform_interceptor_1.TransformInterceptor },
                { provide: core_1.APP_FILTER, useClass: http_exception_filter_1.HttpExceptionFilter },
            ],
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AppModule = _classThis = /** @class */ (function () {
        function AppModule_1() {
        }
        AppModule_1.prototype.configure = function (consumer) {
            consumer.apply(logger_middleware_1.LoggerMiddleware).forRoutes('*');
        };
        return AppModule_1;
    }());
    __setFunctionName(_classThis, "AppModule");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AppModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AppModule = _classThis;
}();
exports.AppModule = AppModule;

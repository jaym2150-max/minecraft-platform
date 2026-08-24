"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@nestjs/core");
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var app_module_1 = require("./app.module");
var swagger_1 = require("@nestjs/swagger");
var helmet_1 = require("helmet");
var compression = require("compression");
var cookieParser = require("cookie-parser");
var csrf_csrf_1 = require("csrf-csrf");
var crypto = require("crypto");
var zod_1 = require("zod");
var env_1 = require("./common/env");
var envSchema = zod_1.z.object({
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    CSRF_SECRET: zod_1.z.string().min(32, 'CSRF_SECRET must be at least 32 characters'),
    DATABASE_URL: zod_1.z.string().url('DATABASE_URL must be a valid URL'),
    REDIS_URL: zod_1.z.string().url('REDIS_URL must be a valid URL').optional(),
    S3_ENDPOINT: zod_1.z.string().url('S3_ENDPOINT must be a valid URL'),
    S3_BUCKET: zod_1.z.string().min(1, 'S3_BUCKET is required'),
});
function validateEnv() {
    var result = envSchema.safeParse(process.env);
    if (!result.success) {
        var missing = result.error.errors.map(function (e) { return "  ".concat(e.path.join('.'), ": ").concat(e.message); }).join('\n');
        throw new Error("Environment validation failed:\n".concat(missing));
    }
}
var CSRF_INSECURE_DEFAULTS = new Set([
    '',
    'dev-csrf-secret-change-in-prod',
    'generate-a-separate-csrf-secret',
]);
/**
 * Resolve the CSRF secret. SECURITY: this is intentionally independent from the
 * JWT signing secret. In production the app refuses to start unless a strong,
 * non-default CSRF_SECRET is configured; in development we derive a stable
 * random value per process instead of shipping a hardcoded constant.
 */
function resolveCsrfSecret(configService) {
    var _a;
    var env = configService.get('NODE_ENV');
    var secret = (_a = configService.get('CSRF_SECRET')) !== null && _a !== void 0 ? _a : '';
    if (env === 'production') {
        if (!secret || CSRF_INSECURE_DEFAULTS.has(secret) || secret.length < 32) {
            throw new Error('FATAL: CSRF_SECRET must be set to a secure, unique value (>= 32 chars) in production. ' +
                'It must NOT be the JWT secret.');
        }
        return secret;
    }
    // Development: prefer an explicit secret, otherwise a stable random one.
    return secret && !CSRF_INSECURE_DEFAULTS.has(secret)
        ? secret
        : crypto.randomBytes(48).toString('hex');
}
function bootstrap() {
    return __awaiter(this, void 0, void 0, function () {
        var logger, app, configService, isProductionEnv, swaggerConfig, document_1, allowedOrigins, csrfSecret_1, doubleCsrfProtection, port, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger = new common_1.Logger('Bootstrap');
                    try {
                        validateEnv();
                        (0, env_1.validateEnv)();
                    }
                    catch (err) {
                        logger.error(err.message);
                        process.exit(1);
                    }
                    return [4 /*yield*/, core_1.NestFactory.create(app_module_1.AppModule, { rawBody: true })];
                case 1:
                    app = _a.sent();
                    app.enableShutdownHooks();
                    configService = app.get(config_1.ConfigService);
                    isProductionEnv = configService.get('NODE_ENV') === 'production';
                    app.use((0, helmet_1.default)({
                        contentSecurityPolicy: {
                            useDefaults: false,
                            directives: {
                                defaultSrc: ["'self'"],
                                baseUri: ["'self'"],
                                scriptSrc: ["'self'", "'unsafe-inline'"],
                                styleSrc: ["'self'", "'unsafe-inline'"],
                                imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
                                connectSrc: ["'self'", 'ws:', 'wss:'],
                                fontSrc: ["'self'", 'data:'],
                                objectSrc: ["'none'"],
                                frameAncestors: ["'none'"],
                                formAction: ["'self'"],
                                manifestSrc: ["'self'"],
                                workerSrc: ["'self'", 'blob:'],
                                frameSrc: ["'none'"],
                            },
                        },
                        crossOriginEmbedderPolicy: { policy: 'require-corp' },
                        crossOriginOpenerPolicy: { policy: 'same-origin' },
                        crossOriginResourcePolicy: { policy: 'same-origin' },
                        dnsPrefetchControl: { allow: false },
                        frameguard: { action: 'deny' },
                        hidePoweredBy: true,
                        hsts: {
                            maxAge: 31536000,
                            includeSubDomains: true,
                            preload: true
                        },
                        ieNoOpen: true,
                        noSniff: true,
                        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
                        xssFilter: true,
                    }));
                    app.use(function (_req, res, next) {
                        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
                        next();
                    });
                    // ── OpenAPI / Swagger (only in non-production) ──
                    if (!isProductionEnv) {
                        swaggerConfig = new swagger_1.DocumentBuilder()
                            .setTitle('Minecraft Platform API')
                            .setDescription('Public REST API for browsing projects, versions, and user profiles. ' +
                            'Authenticated endpoints require a JWT token (from web login) or an API key ' +
                            '(set via `X-API-Key` header or `Authorization: Bearer mp_...`).')
                            .setVersion('1.0')
                            .addServer("http://localhost:".concat(configService.get('API_PORT', 4000)))
                            .addBearerAuth()
                            .addApiKey({ type: 'apiKey', in: 'header', name: 'X-API-Key' }, 'X-API-Key')
                            .build();
                        document_1 = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
                        swagger_1.SwaggerModule.setup('docs', app, document_1, {
                            swaggerOptions: { persistAuthorization: true },
                        });
                        logger.log("Swagger docs available at http://localhost:".concat(configService.get('API_PORT', 4000), "/docs"));
                    }
                    else {
                        logger.log('Swagger docs disabled in production');
                    }
                    allowedOrigins = [
                        configService.get('WEB_URL'),
                        configService.get('ADMIN_URL'),
                    ].filter(function (origin) { return typeof origin === 'string' && origin.length > 0; });
                    app.enableCors({
                        origin: allowedOrigins.length ? allowedOrigins : ['http://localhost:3003'],
                        credentials: true,
                    });
                    app.use(compression());
                    app.use(cookieParser());
                    // CSRF protection is only enabled in production. In development the server
                    // runs on localhost-only ports where same-origin policy + CORS already
                    // provide sufficient protection, and the absence of a CSRF token would
                    // break every mutation endpoint in the SPA workflow.
                    if (isProductionEnv) {
                        csrfSecret_1 = resolveCsrfSecret(configService);
                        doubleCsrfProtection = (0, csrf_csrf_1.doubleCsrf)({
                            getSecret: function () { return csrfSecret_1; },
                            cookieName: '__Host-csrf.x-csrf-token',
                            cookieOptions: {
                                sameSite: 'lax',
                                path: '/',
                                secure: true,
                                httpOnly: true,
                            },
                            size: 64,
                        }).doubleCsrfProtection;
                        app.use(doubleCsrfProtection);
                        logger.log('CSRF protection enabled');
                    }
                    else {
                        logger.log('CSRF protection disabled (development mode)');
                    }
                    app.setGlobalPrefix('api/v1', {
                        exclude: ['health'],
                    });
                    app.useGlobalPipes(new common_1.ValidationPipe({
                        whitelist: true,
                        forbidNonWhitelisted: true,
                        transform: true,
                        transformOptions: {
                            enableImplicitConversion: true,
                        },
                    }));
                    port = configService.get('API_PORT', 4000);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, app.listen(port)];
                case 3:
                    _a.sent();
                    logger.log("API running on http://localhost:".concat(port));
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    if (err_1.code === 'EADDRINUSE') {
                        logger.error("Port ".concat(port, " is already in use. Is another instance running?"));
                        process.exit(1);
                    }
                    throw err_1;
                case 5: return [2 /*return*/];
            }
        });
    });
}
bootstrap();

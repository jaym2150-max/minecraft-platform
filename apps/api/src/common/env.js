"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireEnv = requireEnv;
exports.validateEnv = validateEnv;
var common_1 = require("@nestjs/common");
var zod_1 = require("zod");
var PLACEHOLDER_PREFIXES = [
    'generate-',
    'change-this-',
    'dev-only-',
    'mcp_master_key',
    'mcp_secret_key',
    'mcp_access_key',
];
function isPlaceholder(value) {
    if (!value)
        return true;
    var lower = value.toLowerCase();
    return PLACEHOLDER_PREFIXES.some(function (p) { return lower.includes(p.toLowerCase()); });
}
/**
 * Reads an env var and falls back to a default. Throws inside prod when the
 * value is missing or empty so a misconfigured deploy fails fast.
 */
function requireEnv(name, value, fallback) {
    if (value && value.length > 0)
        return value;
    if (fallback !== undefined)
        return fallback;
    if (process.env.NODE_ENV === 'production') {
        throw new Error("Missing required env var ".concat(name));
    }
    return '';
}
var baseSchema = zod_1.z.object({
    JWT_SECRET: zod_1.z.string().min(1, 'JWT_SECRET is required'),
    JWT_EXPIRATION: zod_1.z.string().min(1, 'JWT_EXPIRATION is required'),
    REFRESH_TOKEN_EXPIRATION: zod_1.z.string().min(1, 'REFRESH_TOKEN_EXPIRATION is required'),
    TFA_ENC_KEY: zod_1.z.string().min(1, 'TFA_ENC_KEY is required'),
    CSRF_SECRET: zod_1.z.string().min(1, 'CSRF_SECRET is required'),
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL is required'),
    REDIS_HOST: zod_1.z.string().min(1, 'REDIS_HOST is required'),
    REDIS_PORT: zod_1.z.string().min(1, 'REDIS_PORT is required'),
    MEILISEARCH_URL: zod_1.z.string().min(1, 'MEILISEARCH_URL is required'),
    MEILISEARCH_API_KEY: zod_1.z.string().min(1, 'MEILISEARCH_API_KEY is required'),
    S3_ENDPOINT: zod_1.z.string().min(1, 'S3_ENDPOINT is required'),
    S3_ACCESS_KEY: zod_1.z.string().min(1, 'S3_ACCESS_KEY is required'),
    S3_SECRET_KEY: zod_1.z.string().min(1, 'S3_SECRET_KEY is required'),
    S3_BUCKET: zod_1.z.string().min(1, 'S3_BUCKET is required'),
});
var prodSchema = baseSchema
    .extend({
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    TFA_ENC_KEY: zod_1.z.string().min(16, 'TFA_ENC_KEY must be at least 16 characters'),
    CSRF_SECRET: zod_1.z.string().min(32, 'CSRF_SECRET must be at least 32 characters'),
    DATABASE_URL: zod_1.z.string().url('DATABASE_URL must be a valid URL'),
    MEILISEARCH_URL: zod_1.z.string().url('MEILISEARCH_URL must be a valid URL'),
    S3_ENDPOINT: zod_1.z.string().url('S3_ENDPOINT must be a valid URL'),
})
    .superRefine(function (data, ctx) {
    for (var _i = 0, _a = [
        'JWT_SECRET',
        'TFA_ENC_KEY',
        'CSRF_SECRET',
        'S3_ACCESS_KEY',
        'S3_SECRET_KEY',
        'MEILISEARCH_API_KEY',
    ]; _i < _a.length; _i++) {
        var key = _a[_i];
        var value = data[key];
        if (isPlaceholder(value)) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: [key],
                message: "".concat(key, " must not contain placeholder / default values"),
            });
        }
    }
});
/**
 * Validates required environment variables. In production, every value must
 * be present, meet length criteria, and not look like a placeholder. In
 * development, missing or weak values are logged as warnings but the
 * application still boots so local dev workflows keep working.
 *
 * Call this once during bootstrap, BEFORE NestFactory.create().
 */
function validateEnv() {
    var logger = new common_1.Logger('EnvValidation');
    var env = process.env.NODE_ENV === 'production' ? prodSchema : baseSchema;
    var result = env.safeParse(process.env);
    if (!result.success) {
        var isProd = process.env.NODE_ENV === 'production';
        var messages = result.error.errors
            .map(function (e) { return "  ".concat(e.path.join('.') || '(root)', ": ").concat(e.message); })
            .join('\n');
        var msg = "Environment validation ".concat(isProd ? 'failed' : 'warnings', ":\n").concat(messages);
        if (isProd) {
            throw new Error(msg);
        }
        logger.warn(msg);
    }
    else if (process.env.NODE_ENV !== 'production') {
        for (var _i = 0, _a = [
            'JWT_SECRET',
            'TFA_ENC_KEY',
            'CSRF_SECRET',
            'S3_ACCESS_KEY',
            'S3_SECRET_KEY',
            'MEILISEARCH_API_KEY',
        ]; _i < _a.length; _i++) {
            var key = _a[_i];
            var value = result.data[key];
            if (isPlaceholder(value)) {
                logger.warn("Env: ".concat(key, " looks like a placeholder value \u2014 replace before deploying to production"));
            }
        }
    }
    return (result.success ? result.data : process.env);
}

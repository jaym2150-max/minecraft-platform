import { Logger } from '@nestjs/common';
import { z } from 'zod';

const PLACEHOLDER_PREFIXES = [
  'generate-',
  'change-this-',
  'dev-only-',
  'mcp_master_key',
  'mcp_secret_key',
  'mcp_access_key',
];

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const lower = value.toLowerCase();
  return PLACEHOLDER_PREFIXES.some((p) => lower.includes(p.toLowerCase()));
}

/**
 * Reads an env var and falls back to a default. Throws inside prod when the
 * value is missing or empty so a misconfigured deploy fails fast.
 */
export function requireEnv(name: string, value: string | undefined, fallback?: string): string {
  if (value && value.length > 0) return value;
  if (fallback !== undefined) return fallback;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required env var ${name}`);
  }
  return '';
}

const baseSchema = z.object({
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRATION: z.string().min(1, 'JWT_EXPIRATION is required'),
  // Refresh-token signing secret. MUST be distinct from JWT_SECRET in
  // production (enforced below) so a leaked access-token secret cannot be
  // used to mint long-lived refresh tokens. Optional in dev for back-compat
  // with existing local envs — AuthService falls back to JWT_SECRET only
  // outside production (validateEnv enforces presence + uniqueness in prod).
  JWT_REFRESH_SECRET: z.string().optional(),
  REFRESH_TOKEN_EXPIRATION: z.string().min(1, 'REFRESH_TOKEN_EXPIRATION is required'),
  TFA_ENC_KEY: z.string().min(1, 'TFA_ENC_KEY is required'),
  CSRF_SECRET: z.string().min(1, 'CSRF_SECRET is required'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_HOST: z.string().min(1, 'REDIS_HOST is required'),
  REDIS_PORT: z.string().min(1, 'REDIS_PORT is required'),
  MEILISEARCH_URL: z.string().min(1, 'MEILISEARCH_URL is required'),
  MEILISEARCH_API_KEY: z.string().min(1, 'MEILISEARCH_API_KEY is required'),
  S3_ENDPOINT: z.string().min(1, 'S3_ENDPOINT is required'),
  S3_ACCESS_KEY: z.string().min(1, 'S3_ACCESS_KEY is required'),
  S3_SECRET_KEY: z.string().min(1, 'S3_SECRET_KEY is required'),
  S3_BUCKET: z.string().min(1, 'S3_BUCKET is required'),
});

const prodSchema = baseSchema
  .extend({
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    TFA_ENC_KEY: z.string().min(16, 'TFA_ENC_KEY must be at least 16 characters'),
    CSRF_SECRET: z.string().min(32, 'CSRF_SECRET must be at least 32 characters'),
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
    MEILISEARCH_URL: z.string().url('MEILISEARCH_URL must be a valid URL'),
    S3_ENDPOINT: z.string().url('S3_ENDPOINT must be a valid URL'),
    // C35 (AUDIT.md): Stripe is in the prodSchema — the previous empty-string
    // fallback in app.config.ts let a misconfigured prod boot silently with
    // an empty STRIPE_SECRET_KEY, so every checkout request would 401 / no-op
    // out. Required + format-guarded here so the API refuses to start until
    // a real `sk_live_…` / `whsec_…` is configured.
    STRIPE_SECRET_KEY: z.string().regex(/^sk_(test_|live_)/, 'STRIPE_SECRET_KEY must be a Stripe live or test key').min(1),
    STRIPE_WEBHOOK_SECRET: z.string().regex(/^whsec_/, 'STRIPE_WEBHOOK_SECRET must start with whsec_').min(1),
  })
  .superRefine((data, ctx) => {
    // Full cross-secret equality guard. None of these four values may match
    // any other — if they did, an attacker who stole one would have every
    // other credential the platform issues (CSRF token forgery, refresh-token
    // minting, 2FA-secret unwrap, JWT signing). The triad is enforced pairwise
    // for every combo, with the offending key named in the error so the
    // operator can fix the env without guesswork.
    const secrets: Array<{ name: string; value: string | undefined }> = [
      { name: 'JWT_SECRET', value: data.JWT_SECRET },
      { name: 'JWT_REFRESH_SECRET', value: data.JWT_REFRESH_SECRET },
      { name: 'CSRF_SECRET', value: data.CSRF_SECRET },
      { name: 'TFA_ENC_KEY', value: data.TFA_ENC_KEY },
    ];
    for (let i = 0; i < secrets.length; i++) {
      for (let j = i + 1; j < secrets.length; j++) {
        const a = secrets[i];
        const b = secrets[j];
        if (!a.value || !b.value) continue;
        if (a.value !== b.value) continue;
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [b.name],
          message: `${b.name} must differ from ${a.name}`,
        });
      }
    }
    for (const key of [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'TFA_ENC_KEY',
      'CSRF_SECRET',
      'S3_ACCESS_KEY',
      'S3_SECRET_KEY',
      'MEILISEARCH_API_KEY',
    ] as const) {
      const value = data[key];
      if (isPlaceholder(value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} must not contain placeholder / default values`,
        });
      }
    }
  });

export type AppEnv = z.infer<typeof baseSchema>;

/**
 * Validates required environment variables. In production, every value must
 * be present, meet length criteria, and not look like a placeholder. In
 * development, missing or weak values are logged as warnings but the
 * application still boots so local dev workflows keep working.
 *
 * Call this once during bootstrap, BEFORE NestFactory.create().
 */
export function validateEnv(): AppEnv {
  const logger = new Logger('EnvValidation');
  const env = process.env.NODE_ENV === 'production' ? prodSchema : baseSchema;
  const result = env.safeParse(process.env);

  if (!result.success) {
    const isProd = process.env.NODE_ENV === 'production';
    const messages = result.error.errors
      .map((e) => `  ${e.path.join('.') || '(root)'}: ${e.message}`)
      .join('\n');
    const msg = `Environment validation ${isProd ? 'failed' : 'warnings'}:\n${messages}`;
    if (isProd) {
      throw new Error(msg);
    }
    logger.warn(msg);
  } else if (process.env.NODE_ENV !== 'production') {
    for (const key of [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'TFA_ENC_KEY',
      'CSRF_SECRET',
      'S3_ACCESS_KEY',
      'S3_SECRET_KEY',
      'MEILISEARCH_API_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
    ] as const) {
      const value = (result.data as Record<string, string | undefined>)[key];
      if (isPlaceholder(value)) {
        logger.warn(`Env: ${key} looks like a placeholder value — replace before deploying to production`);
      }
    }
  }

  return (result.success ? result.data : (process.env as unknown as AppEnv));
}

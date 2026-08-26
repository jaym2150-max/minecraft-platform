import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import * as crypto from 'crypto';
import { z } from 'zod';
import { validateEnv as validateEnvZod } from './common/env';

const envSchema = z.object({
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters')
    .refine((v) => v !== process.env.JWT_SECRET, 'JWT_REFRESH_SECRET must differ from JWT_SECRET'),
  CSRF_SECRET: z.string().min(32, 'CSRF_SECRET must be at least 32 characters'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL').optional(),
  S3_ENDPOINT: z.string().url('S3_ENDPOINT must be a valid URL'),
  S3_BUCKET: z.string().min(1, 'S3_BUCKET is required'),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.errors
      .map((e) => `  ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${missing}`);
  }
}

const CSRF_INSECURE_DEFAULTS = new Set([
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
function resolveCsrfSecret(configService: ConfigService): string {
  const env = configService.get<string>('NODE_ENV');
  const secret = configService.get<string>('CSRF_SECRET') ?? '';

  if (env === 'production') {
    if (!secret || CSRF_INSECURE_DEFAULTS.has(secret) || secret.length < 32) {
      throw new Error(
        'FATAL: CSRF_SECRET must be set to a secure, unique value (>= 32 chars) in production. ' +
          'It must NOT be the JWT secret.',
      );
    }
    return secret;
  }

  // Development: prefer an explicit secret, otherwise a stable random one.
  return secret && !CSRF_INSECURE_DEFAULTS.has(secret)
    ? secret
    : crypto.randomBytes(48).toString('hex');
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    validateEnv();
    validateEnvZod();
  } catch (err: any) {
    logger.error(err.message);
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.enableShutdownHooks();
  const configService = app.get(ConfigService);

  const isProductionEnv = configService.get<string>('NODE_ENV') === 'production';

  app.use(
    helmet({
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
      // C8: gate HSTS on production. Helmet otherwise sends
      // `Strict-Transport-Security` over plain HTTP in dev, which browsers
      // ignore (the header is only honored over https), but emitting it is
      // misleading (it implies TLS is in effect) and a CRLF-injection /
      // header-splitting upstream would forward it raw over plaintext.
      hsts: isProductionEnv
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          }
        : false,
      ieNoOpen: true,
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true,
    }),
  );

  app.use((_req: any, res: any, next: any) => {
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    );
    next();
  });

  // ── OpenAPI / Swagger (only in non-production) ──
  if (!isProductionEnv) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Minecraft Platform API')
      .setDescription(
        'Public REST API for browsing projects, versions, and user profiles. ' +
          'Authenticated endpoints require a JWT token (from web login) or an API key ' +
          '(set via `X-API-Key` header or `Authorization: Bearer mp_...`).',
      )
      .setVersion('1.0')
      .addServer(`http://localhost:${configService.get('API_PORT', 4000)}`)
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', in: 'header', name: 'X-API-Key' }, 'X-API-Key')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    logger.log(
      `Swagger docs available at http://localhost:${configService.get('API_PORT', 4000)}/docs`,
    );
  } else {
    logger.log('Swagger docs disabled in production');
  }

  // Build the allowed-origin list only from configuration rather than a
  // hardcoded extra localhost port. Drop empty/undefined entries so an unset
  // env var doesn't open up `null`/`undefined` as an origin.
  const allowedOrigins = [
    configService.get<string>('app.webUrl'),
    configService.get<string>('app.adminUrl'),
  ].filter((origin): origin is string => typeof origin === 'string' && origin.length > 0);

  if (isProductionEnv && allowedOrigins.length === 0) {
    throw new Error(
      'FATAL: CORS origins not configured. Set WEB_URL and ADMIN_URL in production (e.g. https://minecraft.example.com). Refusing to start with localhost fallback.',
    );
  }

  app.enableCors({
    origin: allowedOrigins.length
      ? allowedOrigins
      : ['http://localhost:3003', 'http://localhost:3001'],
    credentials: true,
  });

  app.use(compression());

  app.use(cookieParser());

  // CSRF protection is only enabled in production. In development the server
  // runs on localhost-only ports where same-origin policy + CORS already
  // provide sufficient protection, and the absence of a CSRF token would
  // break every mutation endpoint in the SPA workflow.
  if (isProductionEnv) {
    const csrfSecret = resolveCsrfSecret(configService);
    const { doubleCsrfProtection, generateToken } = doubleCsrf({
      getSecret: () => csrfSecret,
      // The CSRF token cookie MUST be readable by the SPA's JavaScript so it
      // can echo the token back via the `x-csrf-token` header on every
      // state-changing request. This is the standard double-submit pattern:
      // the token living in a readable cookie is not a secret — what protects
      // the request is that an attacker cannot read a cross-origin cookie to
      // forge the matching header. The signing secret (csrfSecret) never
      // leaves the server. Keeping the cookie httpOnly would make the pattern
      // unenforceable from the client and break every mutation.
      cookieName: '__Host-csrf.x-csrf-token',
      cookieOptions: {
        sameSite: 'lax',
        path: '/',
        secure: true,
        httpOnly: false,
      },
      size: 64,
      // Exact-match exempt — the OAuth consent-code exchange is the ONLY POST
      // that runs BEFORE any authenticated GET (so no CSRF cookie has been
      // issued yet) and from a freshly-redirected browser the SPA can't read
      // document.cookie fast enough on the very first request. Safe to exempt
      // because the exchange is rate-throttled (10/min) and the code is
      // single-use, SHA-256-hashed at rest, and never returned by a GET.
      // Prefix match would silently exclude future sibling routes; use exact.
      skipCsrfProtection: (req) => {
        const url = req.originalUrl ?? req.url ?? '';
        // Strip the query string for the comparison so that
        // `/api/v1/auth/oauth/exchange?x=1` still matches.
        const path = url.split('?')[0];
        return req.method === 'POST' && path === '/api/v1/auth/oauth/exchange';
      },
    });
    app.use(doubleCsrfProtection);
    // Expose a small endpoint so the SPA can pre-seed the CSRF cookie + token
    // on a GET before issuing its first mutation. Registered on the
    // underlying Express instance (INestApplication exposes the raw HTTP
    // server through `app.getHttpAdapter().getInstance()`).
    const httpAdapter = app.getHttpAdapter();
    if (httpAdapter && typeof (httpAdapter as any).get === 'function') {
      (httpAdapter as any).get('/api/v1/auth/csrf-token', (req: any, res: any) => {
        const token = generateToken(req, res, false);
        res.json({ statusCode: 200, data: { token } });
      });
    }
    logger.log('CSRF protection enabled');
  } else {
    logger.log('CSRF protection disabled (development mode)');
  }

  app.setGlobalPrefix('api/v1', {
    exclude: ['health'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = configService.get('API_PORT', 4000);
  try {
    await app.listen(port);
    logger.log(`API running on http://localhost:${port}`);
  } catch (err: any) {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${port} is already in use. Is another instance running?`);
      process.exit(1);
    }
    throw err;
  }
}

bootstrap();

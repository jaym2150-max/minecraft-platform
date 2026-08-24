import { registerAs } from '@nestjs/config';
import { requireEnv } from '../common/env';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.API_PORT || '4000', 10),
  apiUrl: process.env.API_URL || 'http://localhost:4000',
  webUrl: process.env.WEB_URL || 'http://localhost:3000',
  adminUrl: process.env.ADMIN_URL || 'http://localhost:3001',
  jwtSecret: requireEnv('JWT_SECRET', process.env.JWT_SECRET, ''),
  jwtExpiration: process.env.JWT_EXPIRATION || '15m',
  // Distinct signing secret for refresh tokens. Optional in dev (falls back to
  // a deterministic NON-EMPTY placeholder), but env validation in production
  // enforces presence + uniqueness, so a leaked JWT_SECRET cannot mint refresh
  // tokens. NEVER fall back to '' — signing with an empty string makes every
  // refresh token forgeable by anyone who can construct a JWT. The dev
  // placeholder below matches the placeholder-detection list in env.ts so the
  // dev warning block flags it; prodSchema's min(32)+uniqueness guards
  // prevent it from reaching a production deploy.
  refreshTokenSecret: requireEnv(
    'JWT_REFRESH_SECRET',
    process.env.JWT_REFRESH_SECRET,
    'dev-only-rotate-this-refresh-secret-min-32-chars-aa',
  ),
  refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
  logLevel: process.env.LOG_LEVEL || 'debug',
  logFormat: process.env.LOG_FORMAT || 'pretty',
  githubClientId: process.env.GITHUB_CLIENT_ID || '',
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  discordClientId: process.env.DISCORD_CLIENT_ID || '',
  discordClientSecret: process.env.DISCORD_CLIENT_SECRET || '',
  tfaEncKey: process.env.TFA_ENC_KEY || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  useOAuthConsentCode: (process.env.OAUTH_USE_CONSENT_CODE ?? 'true') !== 'false',
}));
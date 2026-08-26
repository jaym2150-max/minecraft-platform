import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { createHash, randomBytes } from 'crypto';

export interface ConsentCodeUser {
  id: string;
  username: string;
  email: string;
  role: string;
  avatarUrl?: string;
  displayName?: string;
  emailVerified: boolean;
}

const DEFAULT_TTL_SECONDS = 60;
const MIN_TTL_SECONDS = 15;
const MAX_TTL_SECONDS = 300;

@Injectable()
export class OAuthConsentCodeService {
  private readonly logger = new Logger(OAuthConsentCodeService.name);

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async issueCode(
    userId: string,
    callbackUrl?: string,
  ): Promise<{ code: string; expiresAt: Date }> {
    const raw = randomBytes(32).toString('hex');
    const codeHash = createHash('sha256').update(raw).digest('hex');
    const ttl = this.resolveTtl();
    const expiresAt = new Date(Date.now() + ttl * 1000);

    await this.prisma.oAuthConsentCode.create({
      data: {
        codeHash,
        userId,
        callbackUrl: this.normalizeCallback(callbackUrl),
        expiresAt,
      },
    });

    // SECURITY: only the SHA-256 hash is durable; the plaintext `raw` lives
    // ONLY in this call frame and is returned once to the caller. Never log
    // it, never serialise it into an error object, and never include it in
    // any field that could reach the logger below. If a future change needs
    // a debug line here, log `codeHash` and `expiresAt` only.
    return { code: raw, expiresAt };
  }

  async consume(code: string): Promise<ConsentCodeUser> {
    if (!code || typeof code !== 'string') {
      throw new BadRequestException('Missing consent code');
    }

    const codeHash = createHash('sha256').update(code).digest('hex');
    const record = await this.prisma.oAuthConsentCode.findUnique({
      where: { codeHash },
    });

    if (!record || record.consumedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired consent code');
    }

    const user = await this.usersService.findOne(record.userId);
    if (!user) {
      throw new BadRequestException('User no longer exists');
    }

    await this.prisma.oAuthConsentCode.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatarUrl: (user as any).avatarUrl ?? undefined,
      displayName: (user as any).displayName ?? undefined,
      emailVerified: (user as any).emailVerified ?? false,
    };
  }

  isEnabled(): boolean {
    return this.configService.get<boolean>('app.useOAuthConsentCode') !== false;
  }

  private resolveTtl(): number {
    const raw = parseInt(
      process.env.OAUTH_CONSENT_CODE_TTL_SECONDS ?? `${DEFAULT_TTL_SECONDS}`,
      10,
    );
    if (Number.isNaN(raw)) return DEFAULT_TTL_SECONDS;
    return Math.min(MAX_TTL_SECONDS, Math.max(MIN_TTL_SECONDS, raw));
  }

  private normalizeCallback(callbackUrl?: string): string | null {
    if (!callbackUrl) return null;
    if (callbackUrl.length > 512) return null;
    // SECURITY: only honor SAME-ORIGIN relative paths. The OAuth consent-code
    // flow redirects the user's browser back to the platform's SPA with a
    // one-time code in the query string; an absolute `https://attacker.com/`
    // callback would redirect the user to an attacker site that could phish
    // the next stage (login-CSRF-style). Absolute URLs are never needed for
    // the same-origin flow, so rejecting outright closes the stored-open-
    // redirect vector. The same constraint as `sanitizeCallback` in
    // oauth.controller.ts — relative, single leading slash, no `//` /
    // backslash variants that browsers normalize into protocol-relative URLs.
    if (!callbackUrl.startsWith('/')) return null;
    if (callbackUrl.startsWith('//')) return null;
    if (callbackUrl.startsWith('/\\')) return null;
    if (callbackUrl.includes('\\')) return null;
    return callbackUrl;
  }
}

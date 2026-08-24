import { Injectable, UnauthorizedException, BadRequestException, ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from './jwt-payload.interface';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { authenticator } from 'otplib';
import { User } from '@mcp/types';

const TOKEN_PREFIX_LENGTH = 8;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private configService: ConfigService,
    // M-B: the email pipeline. Verification, password reset, and (future)
    // security-event emails all flow through here so the notification worker
    // owns the SMTP transport + retries. We never call nodemailer directly
    // from auth — that would couple a security-sensitive send path to the
    // request lifecycle and bypass the worker's retry/DLQ semantics.
    @InjectQueue('notifications') private notificationsQueue: Queue,
  ) {}

  private getEncryptionKey(): Buffer {
    const secret = this.configService.get<string>('app.tfaEncKey');
    if (!secret || secret.length < 16) {
      throw new Error('TFA_ENC_KEY must be set and at least 16 characters');
    }
    return crypto.scryptSync(secret, 'tfa-salt', this.keyLength);
  }

  private encrypt(text: string): string {
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${tag}:${encrypted}`;
  }

  private decrypt(encoded: string): string {
    const key = this.getEncryptionKey();
    const parts = encoded.split(':');
    if (parts.length !== 3) throw new Error('Invalid encrypted format');
    const [ivHex, tagHex, encrypted] = parts;
    const decipher = crypto.createDecipheriv(this.algorithm, key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async validateUser(email: string, password: string): Promise<{ id: string; username: string; email: string; role: string } | null> {
    const user = await this.usersService.findByEmailInternal(email);
    if (user && user.passwordHash && (await bcrypt.compare(password, user.passwordHash))) {
      if (user.banned) {
        throw new ForbiddenException('This account is banned. Contact support.');
      }
      const { passwordHash: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Omit<User, 'passwordHash'>, sessionMeta?: { ip?: string; userAgent?: string }) {
    await this.usersService.updateLastLogin(user.id);

    // Create a server-side session record so the issued token can be revoked.
    // We embed a random `jti` in the JWT and store its hash in the Session
    // table; JwtStrategy rejects requests whose session no longer exists or has
    // expired. Without this, logout / password-change / "revoke all sessions"
    // have no effect on an already-issued JWT.
    const sessionId = crypto.randomUUID();
    const refreshJti = crypto.randomUUID();
    const tokenHash = crypto.createHash('sha256').update(sessionId).digest('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshJti).digest('hex');
    const sessionTTL = this.configService.get<number>('SESSION_TTL_SECONDS', 24 * 60 * 60); // Default 24 hours
    const refreshTTL = this.parseExpiration(
      this.configService.get<string>('app.refreshTokenExpiration') ?? '7d',
      7 * 24 * 60 * 60,
    );
    const now = Date.now();
    const accessExpiresAt = new Date(now + sessionTTL * 1000);
    const refreshExpiresAt = new Date(now + refreshTTL * 1000);

    await this.prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        tokenHash,
        refreshTokenHash,
        ip: sessionMeta?.ip,
        device: sessionMeta?.userAgent,
        expiresAt: accessExpiresAt,
        refreshExpiresAt,
      },
    });

    const { accessToken, refreshToken } = this.signTokenPair({
      user,
      sessionId,
      refreshJti,
      accessExpiresAt,
      refreshExpiresAt,
    });

    return {
      data: {
        user: {
          id: user.id,
          username: user.username,
          displayName: (user as any).displayName ?? undefined,
          email: user.email,
          emailVerified: (user as any).emailVerified ?? false,
          avatarUrl: (user as any).avatarUrl ?? undefined,
          role: user.role,
        },
        token: accessToken,
        refreshToken,
      },
    };
  }

  /**
   * Validate a refresh token, confirm it matches an alive session, block
   * banned users, then ROTATE: issue a fresh access + refresh token pair bound
   * to the same session row (updating its hashes). Rotation defeats reuse — a
   * stolen refresh token becomes single-use; the legitimate client and the
   * attacker can't both succeed, and whoever redeems it first invalidates the
   * other. Returns the new token pair + user, mirroring `login`'s shape so the
   * cookie-setting controller can reuse the same response body.
   */
  async rotateRefreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      username: string;
      displayName?: string;
      email: string;
      emailVerified: boolean;
      avatarUrl?: string;
      role: string;
    };
  }> {
    const decoded = this.jwtService.verify<JwtPayload>(refreshToken, {
      secret: this.getRefreshSecret(),
    });
    if (!decoded || decoded.type !== 'refresh' || !decoded.jti) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const refreshTokenHash = crypto.createHash('sha256').update(decoded.jti).digest('hex');
    // `refreshTokenHash` is indexed but not unique on the Session row (we use
    // an @@index rather than @unique so the migration is non-blocking), so we
    // use findFirst + the hash predicate instead of findUnique. Rotation still
    // guarantees at most one alive row per refresh hash.
    const session = await this.prisma.session.findFirst({
      where: {
        OR: [
          { refreshTokenHash },
          // Reuse-detection: if a presented refresh token matches a row's
          // previousRefreshTokenHash, the legitimate user has already
          // rotated past it — this presentation is a replay (theft signal).
          // We surface that path through the same findFirst then branch on
          // which column matched.
          { previousRefreshTokenHash: refreshTokenHash },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            email: true,
            emailVerified: true,
            avatarUrl: true,
            role: true,
            banned: true,
          },
        },
      },
    });
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }
    // Refresh-token reuse / theft detection. If the presented hash matches
    // the PREVIOUS rotation's hash rather than the live one, the genuine
    // user already consumed this refresh token once (rotating it forward);
    // someone else replaying it is therefore in possession of a stolen token.
    // Per the refresh-token-rotation threat model, we revoke the ENTIRE
    // session family for that user so the attacker cannot keep using either
    // the rotated token or any sibling sessions, and the user must log in
    // again. We do NOT silently accept the rotation in this branch.
    const isReplayedAgainstPreviousHash =
      session.previousRefreshTokenHash === refreshTokenHash &&
      session.refreshTokenHash !== refreshTokenHash;
    if (isReplayedAgainstPreviousHash) {
      this.logger.warn(
        `Refresh-token reuse detected for user=${session.userId} session=${session.id}; revoking all sessions.`,
      );
      await this.invalidateAllSessions(session.userId);
      throw new UnauthorizedException('Session replayed; please sign in again.');
    }
    if (session.refreshExpiresAt && session.refreshExpiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }
    if (session.user.banned) {
      // Drop the session so a banned user's old refresh token is dead too.
      // C15: best-effort delete, but log the failure rather than swallow it
      // so a DB connectivity issue (or a transient prisma error) shows up in
      // the audit trail rather than disappearing with no observability —
      // the refresh attempt is still rejected below so the security posture
      // does not depend on the delete succeeding.
      this.prisma.session
        .delete({ where: { id: session.id } })
        .catch((err) =>
          this.logger.warn(
            `Failed to delete session ${session.id} for banned user=${session.userId}: ${err?.message ?? err}`,
          ),
        );
      throw new ForbiddenException('This account is banned. Contact support.');
    }

    const sessionTTL = this.configService.get<number>('SESSION_TTL_SECONDS', 24 * 60 * 60);
    const refreshTTL = this.parseExpiration(
      this.configService.get<string>('app.refreshTokenExpiration') ?? '7d',
      7 * 24 * 60 * 60,
    );
    const now = Date.now();
    const accessExpiresAt = new Date(now + sessionTTL * 1000);
    const refreshExpiresAt = new Date(now + refreshTTL * 1000);
    const newRefreshJti = crypto.randomUUID();
    const newTokenHash = crypto.createHash('sha256').update(session.id).digest('hex');
    const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshJti).digest('hex');

    // Atomic rotation: swap the refresh hash while stashing the OLD hash in
    // previousRefreshTokenHash (so the next presentation of the old hash is
    // detectable as a replay). The conditional where clause
    // `{ id, refreshTokenHash }` guarantees a concurrent rotation by another
    // presentation of the same token races to count=0 and rejects rather
    // than issuing two tokens off one rotation.
    const rotated = await this.prisma.session.updateMany({
      where: { id: session.id, refreshTokenHash },
      data: {
        tokenHash: newTokenHash,
        previousRefreshTokenHash: refreshTokenHash,
        refreshTokenHash: newRefreshTokenHash,
        expiresAt: accessExpiresAt,
        refreshExpiresAt,
        lastActiveAt: new Date(),
      },
    });
    if (rotated.count === 0) {
      // Either the session was concurrently deleted (logout/ban race) OR a
      // second concurrent presentation of the same old refresh token won the
      // race first. Both surface here as a normal "revoked" rejection.
      throw new UnauthorizedException('Session was revoked');
    }

    const user = session.user;
    const { accessToken, refreshToken: newRefreshToken } = this.signTokenPair({
      user: { id: user.id, username: user.username, email: user.email, role: user.role } as any,
      sessionId: session.id,
      refreshJti: newRefreshJti,
      accessExpiresAt,
      refreshExpiresAt,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName ?? undefined,
        email: user.email,
        emailVerified: user.emailVerified ?? false,
        avatarUrl: user.avatarUrl ?? undefined,
        role: user.role,
      },
    };
  }

  private getRefreshSecret(): string {
    const secret = this.configService.get<string>('app.refreshTokenSecret');
    if (!secret || secret.length < 1) {
      // Should never happen — env validation rejects empty secrets at boot.
      throw new Error('Refresh token secret not configured');
    }
    return secret;
  }

  /**
   * Sign an access + refresh token pair bound to the same session id. The
   * access token is short-lived (jwtExpiration) and validated on every call;
   * the refresh token is longer-lived (refreshTokenExpiration), carries
   * `type:'refresh'`, and is signed with the separate refresh secret.
   */
  private signTokenPair(args: {
    user: { id: string; username: string; email: string; role: string };
    sessionId: string;
    refreshJti: string;
    accessExpiresAt: Date;
    refreshExpiresAt: Date;
  }): { accessToken: string; refreshToken: string } {
    // SECURITY: refuse to sign with an empty access-token secret. A missing
    // JWT_SECRET in dev resolves to '' via requireEnv's fallback path; signing
    // with '' would let anyone mint valid tokens by constructing a JWT with
    // the empty-string secret. Throws early instead of issuing forgeable
    // tokens, surfacing the misconfiguration at the first login attempt
    // rather than letting a dev instance run in a vulnerable state.
    const accessSecret = this.configService.get<string>('app.jwtSecret');
    if (!accessSecret || accessSecret.length < 1) {
      throw new Error('JWT_SECRET not configured');
    }
    const accessPayload: JwtPayload = {
      username: args.user.username,
      sub: args.user.id,
      email: args.user.email,
      role: args.user.role,
      type: 'access',
      jti: args.sessionId,
    };
    const refreshPayload: JwtPayload = {
      username: args.user.username,
      sub: args.user.id,
      email: args.user.email,
      role: args.user.role,
      type: 'refresh',
      jti: args.refreshJti,
    };
    const accessToken = this.jwtService.sign(accessPayload, {
      secret: accessSecret,
      expiresIn: this.configService.get<string>('app.jwtExpiration') || '15m',
    });
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.getRefreshSecret(),
      expiresIn: this.configService.get<string>('app.refreshTokenExpiration') || '7d',
    });
    return { accessToken, refreshToken };
  }

  /**
   * Parse a jwt-style expiration string ("15m", "7d", "3600s") into seconds.
   * Falls back to `defaultSeconds` for an unrecognized/empty value so a
   * misconfigured env can't produce a NaN TTL.
   */
  private parseExpiration(value: string, defaultSeconds: number): number {
    const m = /^(\d+)\s*([smhd])?$/.exec(value.trim());
    if (!m) return defaultSeconds;
    const n = parseInt(m[1], 10);
    switch (m[2] ?? 's') {
      case 's': return n;
      case 'm': return n * 60;
      case 'h': return n * 3600;
      case 'd': return n * 86400;
      default: return defaultSeconds;
    }
  }

  /**
   * Validate that the session backing a JWT (identified by its `jti`) still
   * exists and has not expired. (JwtStrategy performs this check inline via
   * Prisma; this helper is retained for use by other services/tests.)
   */
  async validateSession(jti: string | undefined): Promise<boolean> {
    if (!jti) return false;
    const session = await this.prisma.session.findUnique({
      where: { id: jti },
      select: { expiresAt: true },
    });
    if (!session) return false;
    if (session.expiresAt < new Date()) return false;
    return true;
  }

  async register(username: string, email: string, password: string): Promise<any> {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const existingUsername = await this.usersService.findOneByUsername(username);
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    const passwordHash = await this.usersService.hashPassword(password);

    const user = await this.usersService.create({
      username,
      email,
      passwordHash,
    });

    // Create verification token (logged in dev)
    await this.createEmailVerificationToken(user.id, user.email);

    return this.login(user);
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await this.usersService.hashPassword(newPassword);
    await this.usersService.update(userId, { passwordHash } as any);
    await this.invalidateAllSessions(userId);
  }

  async createPasswordResetToken(email: string): Promise<{ rawToken: string; userId: string } | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const tokenPrefixHash = crypto.createHash('sha256').update(rawToken.slice(0, TOKEN_PREFIX_LENGTH)).digest('hex');
    const expiresAt = new Date(Date.now() + 3600000);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        tokenPrefixHash,
        expiresAt,
      },
    });

    // M-B: enqueue a password-reset email. Same fire-and-forget + jobId
    // pattern as verification — a duplicate request within the TTL
    // coalesces onto the same job instead of sending two emails.
    const origin = process.env.APP_URL ?? 'http://localhost:3003';
    try {
      await this.notificationsQueue.add(
        'send-notification',
        {
          userId: user.id,
          type: 'password-reset',
          title: 'Reset your password',
          body: `${origin}/reset-password?token=<link in email>`,
          data: {
            token: rawToken,
            resetUrl: `${origin}/reset-password?token=${encodeURIComponent(rawToken)}`,
          },
          channels: ['email', 'in-app'],
        },
        {
          jobId: `password-reset:${user.id}`,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: { age: 86400 },
          removeOnFail: { age: 604800 },
        },
      );
    } catch (err) {
      this.logger.warn(`Failed to enqueue password-reset email for user ${user.id}: ${(err as Error).message}`);
    }

    return { rawToken, userId: user.id };
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenPrefixHash = crypto.createHash('sha256').update(token.slice(0, TOKEN_PREFIX_LENGTH)).digest('hex');

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenPrefixHash },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const isValid = await bcrypt.compare(token, resetToken.tokenHash);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    await this.updatePassword(resetToken.userId, newPassword);

    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId, used: false },
    });
  }

  async enable2FA(userId: string): Promise<{ secret: string; qrCodeUrl: string; backupCodes: string[] }> {
    const secret = authenticator.generateSecret();
    const backupCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString('hex'),
    );
    const hashedBackupCodes = await Promise.all(
      backupCodes.map((code) => bcrypt.hash(code, 10)),
    );

    const encryptedSecret = this.encrypt(secret);

    await this.prisma.twoFactorSecret.upsert({
      where: { userId },
      update: { secret: encryptedSecret, backupCodes: hashedBackupCodes, verified: false },
      create: { userId, secret: encryptedSecret, backupCodes: hashedBackupCodes, verified: false },
    });

    const qrCodeUrl = authenticator.keyuri(userId, 'MinecraftPlatform', secret);

    return { secret, qrCodeUrl, backupCodes };
  }

  async verify2FA(userId: string, code: string): Promise<boolean> {
    const twoFA = await this.prisma.twoFactorSecret.findUnique({ where: { userId } });
    if (!twoFA) return false;

    const secret = this.decrypt(twoFA.secret);
    const isValid = authenticator.verify({ token: code, secret }) || await this.verifyBackupCode(twoFA, code);
    if (isValid) {
      await this.prisma.twoFactorSecret.update({
        where: { userId },
        data: { verified: true },
      });
    }
    return isValid;
  }

  async disable2FA(userId: string, code: string): Promise<boolean> {
    const twoFA = await this.prisma.twoFactorSecret.findUnique({ where: { userId } });
    if (!twoFA) return false;

    const secret = this.decrypt(twoFA.secret);
    const isValid = authenticator.verify({ token: code, secret }) || await this.verifyBackupCode(twoFA, code);
    if (isValid) {
      await this.prisma.twoFactorSecret.delete({ where: { userId } });
    }
    return isValid;
  }

  private async verifyBackupCode(twoFA: any, code: string): Promise<boolean> {
    for (const hashedCode of twoFA.backupCodes) {
      if (await bcrypt.compare(code, hashedCode)) {
        const remaining = twoFA.backupCodes.filter((c: string) => c !== hashedCode);
        await this.prisma.twoFactorSecret.update({
          where: { userId: twoFA.userId },
          data: { backupCodes: remaining },
        });
        return true;
      }
    }
    return false;
  }

  private async invalidateAllSessions(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  /**
   * Revoke a single session by its id (the JWT `jti`). Used by logout so the
   * token is dead server-side, not merely cleared from the browser.
   */
  async revokeSession(sessionId: string): Promise<void> {
    try {
      await this.prisma.session.delete({ where: { id: sessionId } });
    } catch {
      // Already gone — nothing to revoke.
    }
  }

  async sendVerificationEmail(email: string): Promise<{ sent: boolean; alreadyVerified?: boolean }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { sent: false };
    if (user.emailVerified) return { sent: false, alreadyVerified: true };

    await this.createEmailVerificationToken(user.id, user.email);
    return { sent: true };
  }

  async resendVerification(userId: string): Promise<{ sent: boolean; alreadyVerified?: boolean }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { sent: false };
    if (user.emailVerified) return { sent: false, alreadyVerified: true };

    await this.createEmailVerificationToken(user.id, user.email);
    return { sent: true };
  }

  async createEmailVerificationToken(userId: string, email: string): Promise<{ rawToken: string }> {
    // Invalidate any existing unused tokens for this user
    await this.prisma.emailVerificationToken.updateMany({
      where: { userId, used: false, expiresAt: { gte: new Date() } },
      data: { expiresAt: new Date(0) },
    });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const tokenPrefixHash = crypto.createHash('sha256').update(rawToken.slice(0, TOKEN_PREFIX_LENGTH)).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.emailVerificationToken.create({
      data: { userId, email, tokenHash, tokenPrefixHash, expiresAt },
    });

    const origin = process.env.APP_URL ?? 'http://localhost:3003';

    // In NON-PRODUCTION only, log a *masked* verification link so a
    // developer can click through to test the flow without SMTP. Previously
    // the raw 64-char token plus the user's PII email hit the app log
    // unconditionally (even in production, where the log sink is
    // long-lived) — anyone with log access could verify any pending email
    // token. Two fixes: (1) gate on NODE_ENV, (2) mask the email to its
    // local-part prefix and never emit the raw token at all (the dev clicks
    // the returned rawToken via the caller path, not the log).
    if (process.env.NODE_ENV !== 'production') {
      const maskedEmail = email.length > 2 ? email.slice(0, 2) + '…@…' : '…@…';
      this.logger.log(
        `Email verification link generated for ${maskedEmail}: ${origin}/verify-email?token=<masked>`,
      );
    }

    // M-B: enqueue a verification email through the notifications queue.
    // Done AFTER the DB write so the worker (which loads the user fresh)
    // sees the new verification token. The job is fire-and-forget: a
    // transient queue failure logs but does not block the user — they can
    // still hit `POST /auth/resend-verification` to retry. The token itself
    // is also returned so dev/test harnesses don't need the email.
    try {
      await this.notificationsQueue.add(
        'send-notification',
        {
          userId,
          type: 'email-verification',
          title: 'Verify your email address',
          body: `${origin}/verify-email?token=<link in email>`,
          data: {
            token: rawToken,
            verifyUrl: `${origin}/verify-email?token=${encodeURIComponent(rawToken)}`,
          },
          channels: ['email', 'in-app'],
        },
        {
          // Stable jobId so a re-enqueue (eg. "resend verification")
          // coalesces rather than spamming the user's inbox. The worker
          // dedupes by jobId.
          jobId: `email-verification:${userId}`,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: { age: 86400 },
          removeOnFail: { age: 604800 },
        },
      );
    } catch (err) {
      this.logger.warn(`Failed to enqueue verification email for user ${userId}: ${(err as Error).message}`);
    }

    return { rawToken };
  }

  async verifyEmail(token: string): Promise<void> {
    const tokenPrefixHash = crypto.createHash('sha256').update(token.slice(0, TOKEN_PREFIX_LENGTH)).digest('hex');

    const verificationToken = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenPrefixHash },
    });

    if (!verificationToken || verificationToken.used || verificationToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const isValid = await bcrypt.compare(token, verificationToken.tokenHash);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: true },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true },
      }),
    ]);
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from './jwt-payload.interface';
import { Request } from 'express';
import { AUTH_COOKIE_NAME } from '../../common/auth-cookie';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => req?.cookies?.[AUTH_COOKIE_NAME] ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('app.jwtSecret'),
    });
  }

  async validate(payload: JwtPayload) {
    // Refresh tokens carry `type:'refresh'` and are signed with a separate
    // secret, so they can't reach this strategy via the access-token extractor
    // in normal operation. Reject them defensively: a refresh token presented
    // as an access credential is either a bug or an attempted privilege
    // confusion and must never authorize an API call.
    if (payload.type === 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    if ((user as any).banned === true) {
      throw new UnauthorizedException('This account is banned. Contact support.');
    }

    // Session-bound revocation: every issued JWT carries a `jti` that points at
    // a Session row. If the session was deleted (logout / password change /
    // revoke-all / admin action) or has expired, the token is rejected even
    // though its signature and exp are still valid. Tokens issued before this
    // check existed (no jti) are rejected so old sessions are force-refreshed.
    if (!payload.jti) {
      throw new UnauthorizedException('Session expired');
    }
    const session = await this.prisma.session.findUnique({
      where: { id: payload.jti },
      select: { expiresAt: true },
    });
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    return { ...user, authType: 'jwt' as const };
  }
}
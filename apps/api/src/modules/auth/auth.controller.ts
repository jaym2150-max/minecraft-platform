import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
  Get,
  UsePipes,
  ValidationPipe,
  Req,
  Logger,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Header,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { OAuthConsentCodeService } from './oauth-consent-code.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyTwoFADto } from './dto/verify-twofa.dto';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ScopesGuard } from '../../common/guards/scopes.guard';
import { Scopes } from '../../common/decorators/scopes.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { ApiKeyScope } from '@prisma/client';
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from '../../common/auth-cookie';

interface AuthRequest extends Request {
  user: { id: string; username: string; email: string; role: string; jti?: string };
  cookies?: Record<string, string | undefined>;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private consentCodes: OAuthConsentCodeService,
  ) {}

  @Public()
  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const headers = req.headers as unknown as Record<string, string>;
    const ip = headers['x-forwarded-for'];
    const userAgent = headers['user-agent'];
    const jwtPayload = await this.authService.login(user as any, { ip, userAgent });
    this.setAuthCookies(res, jwtPayload.data.token, jwtPayload.data.refreshToken);

    return {
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      data: {
        user: jwtPayload.data.user,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Post('register')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(
      registerDto.username,
      registerDto.email,
      registerDto.password,
    );
    this.setAuthCookies(res, result.data.token, result.data.refreshToken);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User registered successfully',
      data: {
        user: result.data.user,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: AuthRequest, @Res({ passthrough: true }) res: Response) {
    // Revoke the server-side session so the token stops working immediately,
    // not just whenever the browser forgets the cookie.
    if (req.user?.jti) {
      await this.authService.revokeSession(req.user.jti);
    }
    this.clearAuthCookies(res);
    return {
      statusCode: HttpStatus.OK,
      message: 'Logged out successfully',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Exchange a valid refresh-token cookie for a NEW access + refresh token pair
   * (rotation). The refresh token is single-use: redeeming it invalidates the
   * presented token and mints a fresh one bound to the same session. This is
   * the only public endpoint that accepts a refresh token; JwtStrategy rejects
   * `type:'refresh'` everywhere else.
   *
   * A missing/expired/invalid refresh token yields 401 so the client can
   * transparently re-authenticate by redirecting to login. The response body
   * matches `login` (user only — tokens live in cookies) so SDK callers can
   * update their cached profile after a successful rotation.
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 30 } })
  async refresh(@Req() req: AuthRequest, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req?.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new UnauthorizedException('Missing refresh token');
    }

    const rotated = await this.authService.rotateRefreshToken(refreshToken);
    this.setAuthCookies(res, rotated.accessToken, rotated.refreshToken);

    return {
      statusCode: HttpStatus.OK,
      message: 'Session refreshed',
      data: { user: rotated.user },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: AuthRequest) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Profile retrieved successfully',
      data: req.user,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @UsePipes(new ValidationPipe({ transform: true }))
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    const result = await this.authService.createPasswordResetToken(body.email);

    if (result) {
      this.logger.log(`Password reset requested for user ${result.userId}`);
    }

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'If an account exists with that email, a reset link has been sent.',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Post('reset-password')
  // Throttle: 64-hex reset token attempts can otherwise be brute-forced via
  // the timing oracle on the prefix-hash index (B6). 3/min + the bcrypt cost
  // makes automated prefix enumeration impractical at the network layer.
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async resetPassword(@Body() body: ResetPasswordDto) {
    await this.authService.resetPassword(body.token, body.password);
    return {
      statusCode: HttpStatus.OK,
      message: 'Password reset successfully',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes(ApiKeyScope.USER_WRITE, ApiKeyScope.WRITE)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async changePassword(@Req() req: AuthRequest, @Body() body: ChangePasswordDto) {
    const isValid = await this.authService.validateUser(req.user.email, body.currentPassword);

    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    await this.authService.updatePassword(req.user.id, body.newPassword);

    return {
      statusCode: HttpStatus.OK,
      message: 'Password changed successfully',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Post('send-verification-email')
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  async sendVerificationEmail(@Body() body: { email: string }) {
    const result = await this.authService.sendVerificationEmail(body.email);
    // SECURITY: previously differentiating "email is already verified" from
    // "an email has been sent" enabled an unauthenticated caller to
    // enumerate which emails are registered AND which are verified. Collapse
    // both branches (and the not-registered branch in the service) into a
    // single generic message so the response leaks no account state.
    void result;
    return {
      statusCode: HttpStatus.OK,
      message: 'If an account exists with that email, a verification email has been sent.',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Post('verify-email')
  // Throttle: same reset-token timing-oracle concern as reset-password.
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() body: { token: string }) {
    await this.authService.verifyEmail(body.token);
    return {
      statusCode: HttpStatus.OK,
      message: 'Email verified successfully',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  // Throttle: same 3/min envelope as send-verification-email to bound abuse.
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Req() req: AuthRequest) {
    const result = await this.authService.resendVerification(req.user.id);
    // SECURITY: collapse the already-verified vs sent branches (as with
    // sendVerificationEmail above) so the response carries no enum signal.
    void result;
    return {
      statusCode: HttpStatus.OK,
      message: 'If the email is not yet verified, a verification email has been sent.',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes(ApiKeyScope.USER_WRITE, ApiKeyScope.WRITE)
  @HttpCode(HttpStatus.OK)
  // C44 (AUDIT.md): the one-time 2FA backup codes returned here are as
  // powerful as the user's password — anyone who reads them can bypass 2FA
  // on a fresh device. They MUST never be cached at any hop (CDN edge,
  // browser, intermediate caches). `no-store` forbids storing the response
  // at all; the web catch-all proxy forwards it verbatim (it only strips
  // hop-by-hop + forwarded-poisoning headers). Same applies to the secret +
  // QR URL which together equal the user's 2FA secret.
  @Header('Cache-Control', 'no-store')
  async enable2FA(@Req() req: AuthRequest) {
    const result = await this.authService.enable2FA(req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: '2FA setup initiated',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes(ApiKeyScope.USER_WRITE, ApiKeyScope.WRITE)
  // Throttle: TOTP is a 6-digit code over a ~90s effective window. Without
  // per-IP throttle a 5 req/s script brute-forces the entropy far enough to
  // find collisions inside the live window; 5/min bounds that to ~1 attempt/
  // window step at the boundary.
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async verify2FA(@Req() req: AuthRequest, @Body() body: VerifyTwoFADto) {
    const verified = await this.authService.verify2FA(req.user.id, body.code);
    if (!verified) {
      throw new UnauthorizedException('Invalid verification code');
    }

    return {
      statusCode: HttpStatus.OK,
      message: '2FA enabled successfully',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes(ApiKeyScope.USER_WRITE, ApiKeyScope.DELETE)
  // Throttle: disabling 2FA requires a valid TOTP/backup code; same rate as
  // verify to bound guessing attempts.
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async disable2FA(@Req() req: AuthRequest, @Body() body: VerifyTwoFADto) {
    const disabled = await this.authService.disable2FA(req.user.id, body.code);
    if (!disabled) {
      throw new UnauthorizedException('Invalid verification code');
    }

    return {
      statusCode: HttpStatus.OK,
      message: '2FA disabled successfully',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Post('oauth/exchange')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  async exchangeOAuthCode(@Body('code') code: string, @Res({ passthrough: true }) res: Response) {
    if (!code || typeof code !== 'string') {
      throw new BadRequestException('Missing consent code');
    }
    const user = await this.consentCodes.consume(code);
    const sessionMeta = { ip: this.extractIp(res), userAgent: undefined };
    const jwtPayload = await this.authService.login(user as any, sessionMeta as any);
    this.setAuthCookies(res, jwtPayload.data.token, jwtPayload.data.refreshToken);
    return {
      statusCode: HttpStatus.OK,
      message: 'OAuth exchange successful',
      data: { user: jwtPayload.data.user },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Set the access-token cookie (browser session, `lax`, `/`) and the
   * refresh-token cookie (`__Host-`, secure+httpOnly, scoped to `/api/v1/auth`
   * so it is ONLY sent on the refresh / logout paths — never on regular API
   * reads, which shrinks interception surface). Production pins `secure`;
   * localhost dev keeps it off so the cookie still arrives over http://.
   */
  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie(AUTH_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // LOW: lax -> strict for same-origin only. Strict prevents the cookie from being sent on
      // cross-site top-level navigations (e.g., user clicks link from email), which is the desired
      // tightest scope for a session cookie. Lax would allow it on GET navigations, which is more
      // permissive than needed for same-origin API calls.
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // `__Secure-` prefix (set on the name) requires `Secure` in prod;
      // scoping to `/api/v1/auth` means the browser sends this cookie ONLY
      // on refresh / logout requests, never on browsing API reads — so a
      // malicious sub-path can't lift the long-lived token. In dev over
      // http://localhost the name reverts to a plain label (no prefix
      // enforcement) so the cookie still arrives.
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth',
    });
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie(AUTH_COOKIE_NAME);
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
  }

  private extractIp(res: Response): string | undefined {
    const req = (res as any).req;
    const xff = req?.headers?.['x-forwarded-for'];
    if (typeof xff === 'string') return xff.split(',')[0].trim();
    return req?.ip ?? undefined;
  }
}

import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  Logger,
  Query,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { OAuthConsentCodeService } from './oauth-consent-code.service';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AUTH_COOKIE_NAME } from '../../common/auth-cookie';

@Controller('auth')
export class OauthController {
  private readonly logger = new Logger(OauthController.name);

  constructor(
    private authService: AuthService,
    private consentCodes: OAuthConsentCodeService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Get('github')
  // D1 (AUDIT.md): fail-closed at the OAuth start endpoint when GitHub
  // credentials aren't configured. Previously the strategy was registered
  // with literal `'not-configured'` placeholders for clientID/clientSecret,
  // so a missing-cred prod would still redirect to github.com/login/oauth/
  // authorize?client_id=not-configured (which GitHub rejects with an error
  // page, but the platform had already leaked that the prod bot tried to
  // start the OAuth flow). The canActivate check below short-circuits before
  // any outbound request.
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    if (
      !this.configService.get<string>('app.githubClientId') ||
      !this.configService.get<string>('app.githubClientSecret')
    ) {
      throw new ServiceUnavailableException('GitHub OAuth is not configured on this deployment');
    }
  }

  @Public()
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('callbackUrl') callbackUrl?: string,
  ) {
    return this.complete(req, res, callbackUrl, 'github');
  }

  @Public()
  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  async discordAuth() {
    if (
      !this.configService.get<string>('app.discordClientId') ||
      !this.configService.get<string>('app.discordClientSecret')
    ) {
      throw new ServiceUnavailableException('Discord OAuth is not configured on this deployment');
    }
  }

  @Public()
  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  async discordCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('callbackUrl') callbackUrl?: string,
  ) {
    return this.complete(req, res, callbackUrl, 'discord');
  }

  private async complete(
    req: Request,
    res: Response,
    callbackUrl: string | undefined,
    provider: 'github' | 'discord',
  ) {
    const user = req.user as any;
    const rawWebUrl = this.configService.get<string>('app.webUrl') || 'http://localhost:3003';
    // D8 (AUDIT.md): collapse duplicate slashes at the origin/path boundary
    // so an operator-configured webUrl that ends with `/` (eg. `https://app.com/`)
    // does NOT produce `https://app.com//auth/...` — which the browser
    // technically tolerates but is the canonical fingerprint of an
    // open-redirect fuzzer in CSP reports.
    const webUrl = rawWebUrl.replace(/\/+$/, '');
    const sanitizedCallback = this.sanitizeCallback(callbackUrl);

    try {
      const jwtPayload = await this.authService.login(user, {
        ip: this.extractIp(req),
        userAgent: req.headers['user-agent'],
      });

      res.cookie(AUTH_COOKIE_NAME, jwtPayload.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
      });

      if (this.consentCodes.isEnabled()) {
        const { code } = await this.consentCodes.issueCode(
          jwtPayload.data.user.id,
          sanitizedCallback ?? undefined,
        );
        const target = sanitizedCallback ?? `/auth/oauth/callback?provider=${provider}`;
        return res.redirect(
          `${webUrl}${target}${target.includes('?') ? '&' : '?'}code=${encodeURIComponent(code)}`,
        );
      }

      return res.redirect(sanitizedCallback ?? `${webUrl}/dashboard`);
    } catch (error) {
      this.logger.error(`${provider} OAuth callback failed: ${error}`);
      const failure = `${webUrl}/auth/oauth/callback?provider=${provider}&error=${encodeURIComponent('OAuth callback failed')}`;
      return res.redirect(failure);
    }
  }

  private sanitizeCallback(callback?: string): string | null {
    if (!callback) return null;
    if (callback.length > 512) return null;
    if (!callback.startsWith('/')) return null;
    // Reject `//` AND backslash-relative paths. Browsers normalize `/\evil`
    // to `//evil` (protocol-relative open-redirect). Rejecting any backslash
    // closes the vector entirely rather than playing whack-a-mole with browser
    // normalization rules.
    if (callback.startsWith('//')) return null;
    if (callback.startsWith('/\\')) return null;
    if (callback.includes('\\')) return null;
    return callback;
  }

  private extractIp(req: Request): string | undefined {
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string') return xff.split(',')[0].trim();
    return req.ip;
  }
}

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  private readonly logger = new Logger(GithubStrategy.name);

  private configured = false;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const clientID = configService.get<string>('app.githubClientId');
    const clientSecret = configService.get<string>('app.githubClientSecret');
    const hasConfig = !!(clientID && clientSecret);

    // Pass dummy values to satisfy passport-oauth2 constructor validation.
    // The validate() method will reject users if the provider is not
    // actually configured.
    super({
      clientID: hasConfig ? clientID : 'not-configured',
      clientSecret: hasConfig ? clientSecret : 'not-configured',
      callbackURL: `${configService.get<string>('app.apiUrl') || 'http://localhost:4000'}/api/v1/auth/github/callback`,
      scope: ['user:email'],
    });

    this.configured = hasConfig;
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    if (!this.configured) {
      throw new UnauthorizedException('GitHub OAuth is not configured');
    }
    const id = String(profile.id);
    const username = profile.username;
    // GitHub's passport profile exposes emails as an array; each entry has a
    // `verified` boolean set from the `/user/emails` response. Only honor a
    // GitHub-verified email — an unverified GitHub email must never be
    // used to link to an existing local account (account-takeover vector)
    // and must never auto-set emailVerified on the local row.
    const primaryEmail = profile.emails?.find((e: any) => e?.primary)?.value
      ?? profile.emails?.[0]?.value;
    const primaryEmailVerifiedAtProvider = profile.emails?.find((e: any) => e?.primary)?.verified
      ?? profile.emails?.[0]?.verified
      ?? false;
    const email = primaryEmail;
    const avatarUrl = profile.photos?.[0]?.value;
    const displayName = profile.displayName || profile.username;

    let user = await this.prisma.user.findFirst({
      where: { githubId: id },
    });

    if (user) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          avatarUrl: avatarUrl ?? user.avatarUrl,
          // Only update the email (and elevate emailVerified) when GitHub
          // proves the email at its side. Falling back to the existing value
          // otherwise preserves whatever the user already set locally.
          email: primaryEmailVerifiedAtProvider ? email : user.email,
          emailVerified: primaryEmailVerifiedAtProvider ? true : user.emailVerified,
        },
      });
      return user;
    }

    if (email && primaryEmailVerifiedAtProvider) {
      // Only link the GitHub identity to an existing local account IF GitHub
      // has verified the email. An unverified GitHub email could be set to a
      // victim's address by an attacker, and auto-linking would hand the
      // victim's account to the attacker.
      user = await this.prisma.user.findUnique({ where: { email } });
      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            githubId: id,
            avatarUrl: avatarUrl ?? user.avatarUrl,
            emailVerified: true,
          },
        });
        return user;
      }
    }

    user = await this.prisma.user.create({
      data: {
        username: await this.uniqueUsername(username || `gh-${id}`),
        email: email ?? `${id}@github.oauth`,
        emailVerified: !!primaryEmailVerifiedAtProvider,
        githubId: id,
        avatarUrl,
        displayName,
        passwordHash: '',
      },
    });

    return user;
  }

  private async uniqueUsername(base: string): Promise<string> {
    let username = base;
    let suffix = 1;
    while (await this.prisma.user.findUnique({ where: { username } })) {
      username = `${base}_${suffix}`;
      suffix++;
    }
    return username;
  }
}

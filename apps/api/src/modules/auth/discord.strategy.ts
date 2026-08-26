import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-discord';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  private readonly logger = new Logger(DiscordStrategy.name);

  private configured = false;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const clientID = configService.get<string>('app.discordClientId');
    const clientSecret = configService.get<string>('app.discordClientSecret');
    const hasConfig = !!(clientID && clientSecret);

    super({
      clientID: hasConfig ? clientID : 'not-configured',
      clientSecret: hasConfig ? clientSecret : 'not-configured',
      callbackURL: `${configService.get<string>('app.apiUrl') || 'http://localhost:4000'}/api/v1/auth/discord/callback`,
      scope: ['identify', 'email'],
    });

    this.configured = hasConfig;
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    if (!this.configured) {
      throw new UnauthorizedException('Discord OAuth is not configured');
    }
    const id = profile.id;
    const username = profile.username;
    const email = profile.email;
    // passport-discord sets `profile.verified` to the user's "Email Verified"
    // flag from Discord. Only trust a Discord-verified email — an unverified
    // Discord email could be set to a victim's address and auto-linking would
    // hand the victim's account to an attacker.
    const emailVerifiedAtProvider = !!profile.verified;
    const displayName = profile.global_name || profile.username;
    const avatarUrl = profile.avatar
      ? `https://cdn.discordapp.com/avatars/${id}/${profile.avatar}.png`
      : undefined;

    let user = await this.prisma.user.findFirst({
      where: { discordId: id },
    });

    if (user) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          avatarUrl: avatarUrl ?? user.avatarUrl,
          // Only update email + emailVerified when Discord proves the email.
          email: emailVerifiedAtProvider ? email : user.email,
          emailVerified: emailVerifiedAtProvider ? true : user.emailVerified,
        },
      });
      return user;
    }

    if (email && emailVerifiedAtProvider) {
      // Only link if Discord has verified the email at its side.
      user = await this.prisma.user.findUnique({ where: { email } });
      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            discordId: id,
            avatarUrl: avatarUrl ?? user.avatarUrl,
            emailVerified: true,
          },
        });
        return user;
      }
    }

    user = await this.prisma.user.create({
      data: {
        username: await this.uniqueUsername(username || `discord-${id}`),
        email: email ?? `${id}@discord.oauth`,
        emailVerified: emailVerifiedAtProvider,
        discordId: id,
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

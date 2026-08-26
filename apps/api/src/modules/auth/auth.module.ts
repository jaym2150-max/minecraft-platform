import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { BullModule } from '@nestjs/bullmq';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OauthController } from './oauth.controller';
import { JwtStrategy } from './jwt.strategy';
import { GithubStrategy } from './github.strategy';
import { DiscordStrategy } from './discord.strategy';
import { OAuthConsentCodeService } from './oauth-consent-code.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('app.jwtSecret'),
        signOptions: { expiresIn: config.get('JWT_EXPIRATION') || '15m' },
      }),
    }),
    // M-B: AuthService emits verification + password-reset emails through
    // the notifications queue. Register it here so `@InjectQueue('notifications')`
    // in AuthService resolves at boot.
    BullModule.registerQueue({ name: 'notifications' }),
  ],
  controllers: [AuthController, OauthController],
  providers: [AuthService, JwtStrategy, GithubStrategy, DiscordStrategy, OAuthConsentCodeService],
  exports: [AuthService, JwtStrategy, PassportModule, OAuthConsentCodeService],
})
export class AuthModule {}

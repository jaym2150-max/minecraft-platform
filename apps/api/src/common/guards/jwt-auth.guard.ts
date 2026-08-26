import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ApiKeysService } from '../../modules/api-keys/api-keys.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    @Inject(forwardRef(() => ApiKeysService))
    private apiKeysService?: ApiKeysService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (user) return user;

    // If JWT failed, try API key
    const svc = this.apiKeysService;
    if (svc) {
      const request = context.switchToHttp().getRequest();
      const apiKey = this.extractApiKey(request);
      if (apiKey) {
        return this.validateApiKey(svc, apiKey, request);
      }
    }

    throw err || new UnauthorizedException('Invalid or expired token');
  }

  private extractApiKey(request: any): string | null {
    const header = request.headers['x-api-key'] as string | undefined;
    if (header) return header;

    const auth = request.headers['authorization'] as string | undefined;
    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.slice(7);
      if (token.startsWith('mp_')) return token;
    }

    return null;
  }

  private async validateApiKey(svc: ApiKeysService, key: string, request: any) {
    const result = await svc.validate(key);
    if (!result) {
      throw new UnauthorizedException('Invalid or expired API key');
    }

    // `scopes` is now an ApiKeyScope[] from Prisma; surface it on req.user so
    // the ScopesGuard can read it. We also tag the auth method so guards can
    // tell API-key sessions apart from JWT sessions (e.g. for audit logs).
    request.apiKeyScopes = result.scopes;
    request.user = {
      id: result.userId,
      scopes: result.scopes,
      authType: 'apiKey',
    };
    return request.user;
  }
}

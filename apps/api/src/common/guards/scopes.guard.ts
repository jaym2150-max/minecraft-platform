import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeyScope, UserRole } from '@prisma/client';
import { SCOPES_KEY } from '../decorators/scopes.decorator';

@Injectable()
export class ScopesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<ApiKeyScope[] | undefined>(
      SCOPES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // JWT-authenticated sessions have full access. The auth controller is
    // the only place a session is issued, and the user role is loaded into
    // req.user by JwtStrategy; admins/moderators/owners are unrestricted.
    if (user.authType === 'jwt' || user.role === UserRole.ADMIN || user.role === UserRole.OWNER) {
      return true;
    }

    const scopes: ApiKeyScope[] = Array.isArray(user.scopes)
      ? user.scopes
      : typeof user.scopes === 'string'
        ? (user.scopes.split(',').map((s: string) => s.trim()).filter(Boolean) as ApiKeyScope[])
        : [];

    // ADMIN scope satisfies any requirement.
    if (scopes.includes(ApiKeyScope.ADMIN)) return true;

    const hasMatch = required.some((s) => scopes.includes(s));
    if (!hasMatch) {
      throw new ForbiddenException(
        `Missing required API key scope(s): ${required.join(', ')}`,
      );
    }
    return true;
  }
}

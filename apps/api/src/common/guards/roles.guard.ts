import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    // No attached user means the JwtAuthGuard did not authenticate (eg. a
    // route that is @Public, or a misconfigured guard order). Surface a
    // message-bearing Unauthorized so the caller sees a clear reason rather
    // than Nest's bare 403-with-empty-body.
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    if (!requiredRoles.includes(user.role)) {
      // M-B: previously returned `false` silently, yielding a bare 403 with
      // no body — ops/SDK callers couldn't distinguish a missing role from a
      // misconfigured route. Throw a message-bearing ForbiddenException naming
      // the user's role and the required set so the failure is diagnosable.
      throw new ForbiddenException(
        `Forbidden — your role "${user.role}" is not permitted. Requires one of: ${requiredRoles.join(', ')}`,
      );
    }
    return true;
  }
}

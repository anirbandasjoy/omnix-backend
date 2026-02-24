import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators';

interface RequestUser {
  roles?: string[];
  [key: string]: unknown;
}

interface RequestWithUser {
  user?: RequestUser;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied: No user context found');
    }

    if (!user.roles || !Array.isArray(user.roles)) {
      throw new ForbiddenException('Access denied: No roles assigned');
    }

    const hasRole = requiredRoles.some(
      (role) => user.roles?.includes(role) ?? false,
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied: Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}

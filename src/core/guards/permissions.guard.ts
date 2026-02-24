import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators';

interface RequestUser {
  permissions?: string[];
  roles?: string[];
  [key: string]: unknown;
}

interface RequestWithUser {
  user?: RequestUser;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied: No user context found');
    }

    if (!user.permissions || !Array.isArray(user.permissions)) {
      throw new ForbiddenException('Access denied: No permissions assigned');
    }

    const hasPermission = requiredPermissions.some(
      (permission) => user.permissions?.includes(permission) ?? false,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied: Required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}

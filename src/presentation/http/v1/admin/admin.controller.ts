/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RbacService } from '../../../../domains/rbac/services/rbac.service';
import { ActivityService } from '../../../../domains/activity/services/activity.service';
import { UserService } from '../../../../domains/user/services/user.service';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../core/guards/roles.guard';
import { Roles } from '../../../../core/decorators/roles.decorator';
import {
  CreateRoleDto,
  UpdateRoleDto,
  CreatePermissionDto,
  UpdatePermissionDto,
  RoleResponseDto,
  PermissionResponseDto,
} from '../../../../domains/rbac/dto/rbac.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { SystemStatsResponseDto } from '../../../../domains/system/dto/system.dto';
import { ErrorResponseDto } from '../../../../shared/dto/common.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private readonly rbacService: RbacService,
    private readonly activityService: ActivityService,
    private readonly userService: UserService,
  ) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Get system statistics',
    description:
      'Returns system-wide statistics including users, sessions, activities, media, roles, and permissions counts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: SystemStatsResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
    type: ErrorResponseDto,
  })
  async getStats(): Promise<{
    users: number;
    sessions: number;
    activities: number;
    media: number;
    roles: number;
    permissions: number;
  }> {
    const users = this.rbacService.getUserCount();
    const [roles, permissions] = await Promise.all([
      this.rbacService.getRoleCount(),
      this.rbacService.getPermissionCount(),
    ]);

    return {
      users: users || 0,
      sessions: 0,
      activities: 0,
      media: 0,
      roles: roles || 0,
      permissions: permissions || 0,
    };
  }

  @Get('roles')
  @ApiOperation({
    summary: 'Get all roles',
    description: 'Returns list of all roles with their associated permissions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Roles retrieved successfully',
    type: [RoleResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
    type: ErrorResponseDto,
  })
  async getRoles(): Promise<RoleResponseDto[]> {
    return this.rbacService.getAllRoles();
  }

  @Post('roles')
  @ApiOperation({
    summary: 'Create a new role',
    description:
      'Creates a new role with optional permissions. Permissions can be assigned during creation or later.',
  })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Role already exists',
    type: ErrorResponseDto,
  })
  async createRole(
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<RoleResponseDto> {
    const role = await this.rbacService.createRole(createRoleDto);

    if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
      for (const permissionId of createRoleDto.permissions) {
        await this.rbacService.assignPermissionToRole(role.id, permissionId);
      }
    }

    await this.activityService.log({
      userId: 'system',
      type: 'role_created',
      action: 'create_role',
      description: `Role created: ${createRoleDto.name}`,
    });

    return role;
  }

  @Patch('roles/:id')
  @ApiOperation({
    summary: 'Update a role',
    description: 'Updates role information such as name and description.',
  })
  @ApiParam({
    name: 'id',
    description: 'Role ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
    type: ErrorResponseDto,
  })
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    const role = await this.rbacService.updateRole(id, updateRoleDto);

    await this.activityService.log({
      userId: 'system',
      type: 'role_updated',
      action: 'update_role',
      description: `Role updated: ${id}`,
    });

    return role;
  }

  @Delete('roles/:id')
  @ApiOperation({
    summary: 'Delete a role',
    description:
      'Permanently deletes a role. This will remove the role from all users assigned to it.',
  })
  @ApiParam({
    name: 'id',
    description: 'Role ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Role deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Role deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
    type: ErrorResponseDto,
  })
  async deleteRole(@Param('id') id: string): Promise<any> {
    await this.rbacService.deleteRole(id);

    await this.activityService.log({
      userId: 'system',
      type: 'role_deleted',
      action: 'delete_role',
      description: `Role deleted: ${id}`,
    });

    return { message: 'Role deleted successfully' };
  }

  @Get('permissions')
  @ApiOperation({
    summary: 'Get all permissions',
    description: 'Returns list of all permissions in the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
    type: [PermissionResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
    type: ErrorResponseDto,
  })
  async getPermissions(): Promise<PermissionResponseDto[]> {
    return this.rbacService.getAllPermissions();
  }

  @Post('permissions')
  @ApiOperation({
    summary: 'Create a new permission',
    description:
      'Creates a new permission with resource, action, and optional description.',
  })
  @ApiBody({ type: CreatePermissionDto })
  @ApiResponse({
    status: 201,
    description: 'Permission created successfully',
    type: PermissionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Permission already exists',
    type: ErrorResponseDto,
  })
  async createPermission(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionResponseDto> {
    const permission =
      await this.rbacService.createPermission(createPermissionDto);

    await this.activityService.log({
      userId: 'system',
      type: 'permission_created',
      action: 'create_permission',
      description: `Permission created: ${createPermissionDto.name}`,
    });

    return permission;
  }

  @Patch('permissions/:id')
  @ApiOperation({
    summary: 'Update a permission',
    description: 'Updates permission information such as name and description.',
  })
  @ApiParam({
    name: 'id',
    description: 'Permission ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdatePermissionDto })
  @ApiResponse({
    status: 200,
    description: 'Permission updated successfully',
    type: PermissionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Permission not found',
    type: ErrorResponseDto,
  })
  async updatePermission(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    const permission = await this.rbacService.updatePermission(
      id,
      updatePermissionDto,
    );

    await this.activityService.log({
      userId: 'system',
      type: 'permission_updated',
      action: 'update_permission',
      description: `Permission updated: ${id}`,
    });

    return permission;
  }

  @Delete('permissions/:id')
  @ApiOperation({
    summary: 'Delete a permission',
    description:
      'Permanently deletes a permission. This will remove the permission from all roles that have it.',
  })
  @ApiParam({
    name: 'id',
    description: 'Permission ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Permission deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Permission not found',
    type: ErrorResponseDto,
  })
  async deletePermission(@Param('id') id: string): Promise<any> {
    await this.rbacService.deletePermission(id);

    await this.activityService.log({
      userId: 'system',
      type: 'permission_deleted',
      action: 'delete_permission',
      description: `Permission deleted: ${id}`,
    });

    return { message: 'Permission deleted successfully' };
  }

  @Post('roles/:roleId/permissions/:permissionId')
  @ApiOperation({
    summary: 'Assign permission to role',
    description: 'Assigns a permission to a role.',
  })
  @ApiParam({
    name: 'roleId',
    description: 'Role ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'permissionId',
    description: 'Permission ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission assigned successfully',
    schema: {
      example: {
        success: true,
        message: 'Permission assigned successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Role or permission not found',
    type: ErrorResponseDto,
  })
  async assignPermissionToRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ): Promise<any> {
    await this.rbacService.assignPermissionToRole(roleId, permissionId);

    await this.activityService.log({
      userId: 'system',
      type: 'permission_assigned',
      action: 'assign_permission',
      description: `Permission ${permissionId} assigned to role ${roleId}`,
    });

    return { message: 'Permission assigned successfully' };
  }

  @Delete('roles/:roleId/permissions/:permissionId')
  @ApiOperation({
    summary: 'Remove permission from role',
    description: 'Removes a permission from a role.',
  })
  @ApiParam({
    name: 'roleId',
    description: 'Role ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'permissionId',
    description: 'Permission ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission removed successfully',
    schema: {
      example: {
        success: true,
        message: 'Permission removed successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Role or permission not found',
    type: ErrorResponseDto,
  })
  async removePermissionFromRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ): Promise<any> {
    await this.rbacService.removePermissionFromRole(roleId, permissionId);

    await this.activityService.log({
      userId: 'system',
      type: 'permission_removed',
      action: 'remove_permission',
      description: `Permission ${permissionId} removed from role ${roleId}`,
    });

    return { message: 'Permission removed successfully' };
  }

  @Get('activities')
  @ApiOperation({
    summary: 'Get system-wide activities',
    description: 'Returns recent activities across all users in the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'Activities retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            userId: '550e8400-e29b-41d4-a716-446655440001',
            type: 'login',
            action: 'user_login',
            description: 'User logged in',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      },
    },
  })
  async getActivities(@Query('limit') limit = 20): Promise<any> {
    return this.activityService.getRecentActivities(limit);
  }

  @Get('users/:id/roles')
  @ApiOperation({
    summary: 'Get user roles',
    description: 'Returns all roles assigned to a specific user.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'User roles retrieved successfully',
    schema: {
      example: {
        roles: ['admin', 'editor'],
      },
    },
  })
  async getUserRoles(@Param('id') id: string): Promise<string[]> {
    return this.rbacService.getUserRoles(id);
  }

  @Get('users/:id/permissions')
  @ApiOperation({
    summary: 'Get user permissions',
    description:
      'Returns all permissions a user has through their assigned roles.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'User permissions retrieved successfully',
    schema: {
      example: {
        permissions: ['user.create', 'user.update', 'user.delete'],
      },
    },
  })
  async getUserPermissions(@Param('id') id: string): Promise<string[]> {
    return this.rbacService.getUserPermissions(id);
  }
}

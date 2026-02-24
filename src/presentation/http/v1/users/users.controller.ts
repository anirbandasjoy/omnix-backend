/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { PaginationQueryDto } from '../../../../shared/dto/pagination.dto';
import { UserService } from '../../../../domains/user/services/user.service';
import { RbacService } from '../../../../domains/rbac/services/rbac.service';
import { ActivityService } from '../../../../domains/activity/services/activity.service';
import { JwtAuthGuard, RolesGuard } from '../../../../core/guards';
import { CurrentUser, Roles } from '../../../../core/decorators';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import {
  GetUsersResponseDto,
  RegisterResponseDto,
  EmptyResponseDto,
} from '../../../../domains/user/dto/user.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly rbacService: RbacService,
    private readonly activityService: ActivityService,
  ) {}

  @Get()
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'List all users (Admin only)',
    description:
      'Returns paginated list of all users. Supports search and sorting.',
  })
  @ApiQuery({ type: PaginationQueryDto })
  @ZodResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: GetUsersResponseDto,
  })
  async findAll(@Query() pagination: PaginationQueryDto): Promise<any> {
    const {
      page = 1,
      pageSize: limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = pagination;

    const result = await this.userService.getPaginatedUsers({
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    });

    return {
      data: result.data,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
        hasNext: page * limit < result.total,
        hasPrev: page > 1,
      },
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description:
      'Returns user details. Admin can access any user, regular users can only access their own data.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ZodResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: RegisterResponseDto,
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<any> {
    if (currentUser.roles?.includes('admin') || currentUser.id === id) {
      const user = await this.userService.findById(id);
      if (!user) {
        return { message: 'User not found' };
      }
      return user;
    }
    return { message: 'Forbidden' };
  }

  @Get(':id/profile')
  @ApiOperation({
    summary: 'Get user profile',
    description:
      'Returns detailed profile information for the specified user. Admin can access any profile, regular users can only access their own.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ZodResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: RegisterResponseDto,
  })
  async getProfile(@Param('id') id: string): Promise<any> {
    return this.userService.getProfile(id);
  }

  @Patch(':id/profile')
  @ApiOperation({
    summary: 'Update user profile',
    description:
      'Updates profile information for the specified user. Admin can update any profile, regular users can only update their own.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        displayName: { type: 'string', example: 'John Doe' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        bio: { type: 'string', example: 'Software developer' },
      },
    },
  })
  @ZodResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: RegisterResponseDto,
  })
  async updateProfile(
    @Param('id') id: string,
    @Body() updateProfileDto: any,
    @CurrentUser() currentUser: any,
  ): Promise<any> {
    if (currentUser.roles?.includes('admin') || currentUser.id === id) {
      return this.userService.updateProfile(id, updateProfileDto);
    }
    return { message: 'Forbidden' };
  }

  @Post(':id/roles')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Assign roles to user (Admin only)',
    description:
      'Assigns one or more roles to a user. Existing roles will be replaced.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        roleIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['550e8400-e29b-41d4-a716-446655440000'],
        },
      },
    },
  })
  @ZodResponse({
    status: 200,
    description: 'Roles assigned successfully',
    type: EmptyResponseDto,
  })
  async assignRole(
    @Param('id') id: string,
    @Body() assignRoleDto: { roleIds: string[] },
    @CurrentUser() currentUser: any,
  ): Promise<any> {
    await this.rbacService.assignRolesToUser(
      id,
      assignRoleDto.roleIds,
      currentUser.id,
    );

    await this.activityService.log({
      userId: id,
      type: 'role_assigned',
      action: 'assign_roles',
      description: `Roles assigned: ${assignRoleDto.roleIds.join(', ')}`,
    });

    return { message: 'Roles assigned successfully' };
  }

  @Delete(':id/roles/:roleId')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Remove role from user (Admin only)',
    description: 'Removes a specific role from a user.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'roleId',
    description: 'Role ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ZodResponse({
    status: 200,
    description: 'Role removed successfully',
    type: EmptyResponseDto,
  })
  async removeRole(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
  ): Promise<any> {
    await this.rbacService.removeRoleFromUser(id, roleId);

    await this.activityService.log({
      userId: id,
      type: 'role_removed',
      action: 'remove_role',
      description: `Role removed: ${roleId}`,
    });

    return { message: 'Role removed successfully' };
  }

  @Get(':id/activities')
  @ApiOperation({
    summary: 'Get user activities',
    description:
      'Returns paginated list of activities for the specified user. Admin can view any user activities, regular users can only view their own.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({ type: PaginationQueryDto })
  @ZodResponse({
    status: 200,
    description: 'Activities retrieved successfully',
    type: GetUsersResponseDto,
  })
  async getActivities(
    @Param('id') id: string,
    @Query() pagination: PaginationQueryDto,
  ): Promise<any> {
    const { page = 1, pageSize: limit = 20 } = pagination;
    const offset = (page - 1) * limit;
    return this.activityService.getUserActivities(id, {
      limit,
      offset,
    });
  }

  @Post(':id/deactivate')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deactivate user (Admin only)',
    description:
      'Deactivates a user account. The user will not be able to log in.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ZodResponse({
    status: 200,
    description: 'User deactivated successfully',
    type: EmptyResponseDto,
  })
  async deactivate(@Param('id') id: string): Promise<any> {
    await this.userService.deactivateUser(id);

    await this.activityService.log({
      userId: id,
      type: 'user_deactivated',
      action: 'deactivate_user',
      description: 'User deactivated by admin',
    });

    return { message: 'User deactivated successfully' };
  }

  @Post(':id/activate')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activate user (Admin only)',
    description: 'Activates a previously deactivated user account.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ZodResponse({
    status: 200,
    description: 'User activated successfully',
    type: EmptyResponseDto,
  })
  async activate(@Param('id') id: string): Promise<any> {
    await this.activityService.log({
      userId: id,
      type: 'user_activated',
      action: 'activate_user',
      description: 'User activated by admin',
    });

    return { message: 'User activated successfully' };
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Delete user (Admin only)',
    description:
      'Permanently deletes a user account. This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ZodResponse({
    status: 200,
    description: 'User deleted successfully',
    type: EmptyResponseDto,
  })
  async terminate(@Param('id') id: string): Promise<any> {
    await this.userService.terminateUser(id);

    await this.activityService.log({
      userId: id,
      type: 'user_deleted',
      action: 'delete_user',
      description: 'User terminated by admin',
    });

    return { message: 'User terminated successfully' };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description:
      'Updates user information. Admin can update any user, regular users can only update their own account.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'newemail@example.com' },
        displayName: { type: 'string', example: 'Jane Doe' },
        isActive: { type: 'boolean', example: true },
      },
    },
  })
  @ZodResponse({
    status: 200,
    description: 'User updated successfully',
    type: RegisterResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: any,
    @CurrentUser() currentUser: any,
  ): Promise<any> {
    if (currentUser.roles?.includes('admin') || currentUser.id === id) {
      return this.userService.update(id, updateUserDto);
    }
    return { message: 'Forbidden' };
  }
}

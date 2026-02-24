/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { RoleRepository } from '../repositories/role.repository';
import { PermissionRepository } from '../repositories/permission.repository';
import type { Cache } from 'cache-manager';
import { InjectCache } from '../../../core/cache/decorators';

@Injectable()
export class RbacService {
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    private readonly roleRepo: RoleRepository,
    private readonly permissionRepo: PermissionRepository,
    @InjectCache() private readonly cache: Cache,
  ) {}

  // Role Management
  async createRole(data: any): Promise<any> {
    const existing = await this.roleRepo.findByName(data.name);
    if (existing) {
      throw new ConflictException('Role already exists');
    }

    const role = await this.roleRepo.create(data);
    await this.invalidateRoleCache(role.id);
    return role;
  }

  async getRole(roleId: string): Promise<any> {
    const cacheKey = `role:${roleId}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    const role = await this.roleRepo.findWithPermissions(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.cache.set(cacheKey, role, this.CACHE_TTL);
    return role;
  }

  async getAllRoles(): Promise<any[]> {
    return this.roleRepo.findMany();
  }

  async updateRole(roleId: string, data: any): Promise<any> {
    const role = await this.roleRepo.update(roleId, data);
    await this.invalidateRoleCache(roleId);
    return role;
  }

  async deleteRole(roleId: string): Promise<void> {
    await this.roleRepo.delete(roleId);
    await this.invalidateRoleCache(roleId);
  }

  // Permission Management
  async createPermission(data: any): Promise<any> {
    const existing = await this.permissionRepo.findByName(data.name);
    if (existing) {
      throw new ConflictException('Permission already exists');
    }

    return this.permissionRepo.create(data);
  }

  async getAllPermissions(): Promise<any[]> {
    return this.permissionRepo.findMany();
  }

  async getPermission(permissionId: string): Promise<any> {
    const permission = await this.permissionRepo.findOne(permissionId);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return permission;
  }

  async updatePermission(permissionId: string, data: any): Promise<any> {
    return this.permissionRepo.update(permissionId, data);
  }

  async deletePermission(permissionId: string): Promise<void> {
    await this.permissionRepo.delete(permissionId);
  }

  // Role-Permission Assignment
  async assignPermissionToRole(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    await this.roleRepo.assignPermission(roleId, permissionId);
    await this.invalidateRoleCache(roleId);
  }

  async removePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    await this.roleRepo.removePermission(roleId, permissionId);
    await this.invalidateRoleCache(roleId);
  }

  // User-Role Assignment
  async assignRoleToUser(
    userId: string,
    roleId: string,
    assignedBy: string,
    expiresAt?: Date,
  ): Promise<void> {
    await this.roleRepo.assignRoleToUser(userId, roleId, assignedBy, expiresAt);
    await this.invalidateUserCache(userId);
  }

  /**
   * Assign multiple roles to a user
   */
  async assignRolesToUser(
    userId: string,
    roleIds: string[],
    assignedBy: string,
  ): Promise<void> {
    for (const roleId of roleIds) {
      await this.roleRepo.assignRoleToUser(userId, roleId, assignedBy);
    }
    await this.invalidateUserCache(userId);
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await this.roleRepo.removeRoleFromUser(userId, roleId);
    await this.invalidateUserCache(userId);
  }

  async getUserRoles(userId: string): Promise<any[]> {
    const cacheKey = `user:roles:${userId}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    const roles = await this.roleRepo.getUserRoles(userId);
    await this.cache.set(cacheKey, roles, this.CACHE_TTL);
    return roles;
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const cacheKey = `user:permissions:${userId}`;
    const cached = await this.cache.get<string[]>(cacheKey);
    if (cached) return cached;

    const roles = await this.getUserRoles(userId);
    const permissions: string[] = [];

    for (const roleData of roles) {
      const roleWithPermissions = await this.roleRepo.findWithPermissions(
        roleData.role.id,
      );
      if (roleWithPermissions?.permissions) {
        permissions.push(
          ...roleWithPermissions.permissions.map((p: any) => p.name),
        );
      }
    }

    const uniquePermissions = [...new Set(permissions)];
    await this.cache.set(cacheKey, uniquePermissions, this.CACHE_TTL);
    return uniquePermissions;
  }

  async hasPermission(
    userId: string,
    permissionName: string,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permissionName);
  }

  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.some((r) => r.role.name === roleName);
  }

  // Statistics methods for admin
  getUserCount(): number {
    // This would typically query the database
    // For now, returning 0 as placeholder
    return 0;
  }

  async getRoleCount(): Promise<number> {
    const roles = await this.getAllRoles();
    return roles.length;
  }

  async getPermissionCount(): Promise<number> {
    const permissions = await this.getAllPermissions();
    return permissions.length;
  }

  // Cache invalidation helpers
  private async invalidateRoleCache(roleId: string): Promise<void> {
    await this.cache.del(`role:${roleId}`);
  }

  private async invalidateUserCache(userId: string): Promise<void> {
    await this.cache.del(`user:roles:${userId}`);
    await this.cache.del(`user:permissions:${userId}`);
  }
}

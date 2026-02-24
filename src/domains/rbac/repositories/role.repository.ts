import { Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  roles,
  rolePermissions,
  userRoles,
  permissions,
} from '../../../database/schema';
import { BaseRepository, InjectDatabase } from '../../../core/database';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class RoleRepository extends BaseRepository<any, typeof roles> {
  constructor(@InjectDatabase() protected readonly db: NodePgDatabase<any>) {
    super(db, roles);
  }

  async findByName(name: string): Promise<typeof roles.$inferSelect | null> {
    const result = await this.db
      .select()
      .from(roles)
      .where(eq(roles.name, name))
      .limit(1);
    return result[0] || null;
  }

  async findWithPermissions(roleId: string): Promise<
    | (typeof roles.$inferSelect & {
        permissions: (typeof permissions.$inferSelect)[];
      })
    | null
  > {
    const role = (await this.findOne(roleId)) as
      | typeof roles.$inferSelect
      | null;
    if (!role) return null;

    const permissionList = await this.db
      .select({
        permission: permissions,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));

    return {
      ...role,
      permissions: permissionList.map((p) => p.permission),
    } as typeof roles.$inferSelect & {
      permissions: (typeof permissions.$inferSelect)[];
    };
  }

  async assignPermission(roleId: string, permissionId: string): Promise<void> {
    await this.db.insert(rolePermissions).values({
      roleId,
      permissionId,
    });
  }

  async removePermission(roleId: string, permissionId: string): Promise<void> {
    await this.db
      .delete(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleId, roleId),
          eq(rolePermissions.permissionId, permissionId),
        ),
      );
  }

  async getUserRoles(userId: string): Promise<
    Array<{
      role: typeof roles.$inferSelect;
      userRole: typeof userRoles.$inferSelect;
    }>
  > {
    return this.db
      .select({
        role: roles,
        userRole: userRoles,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId)) as Promise<
      Array<{
        role: typeof roles.$inferSelect;
        userRole: typeof userRoles.$inferSelect;
      }>
    >;
  }

  async assignRoleToUser(
    userId: string,
    roleId: string,
    assignedBy: string,
    expiresAt?: Date,
  ): Promise<void> {
    await this.db.insert(userRoles).values({
      userId,
      roleId,
      assignedBy,
      expiresAt,
    });
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await this.db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
  }
}

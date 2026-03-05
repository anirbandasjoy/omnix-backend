import { Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { permissions, rolePermissions } from '../../../database/schemas';
import { eq, or, like } from 'drizzle-orm';
import { BaseRepository, InjectDatabase } from '../../../core/database';

@Injectable()
export class PermissionRepository extends BaseRepository<
  any,
  typeof permissions
> {
  constructor(@InjectDatabase() protected readonly db: NodePgDatabase<any>) {
    super(db, permissions);
  }

  async findByName(
    name: string,
  ): Promise<typeof permissions.$inferSelect | null> {
    const result = await this.db
      .select()
      .from(permissions)
      .where(eq(permissions.name, name))
      .limit(1);
    return result[0] || null;
  }

  async findByResource(
    resource: string,
  ): Promise<(typeof permissions.$inferSelect)[]> {
    return this.db
      .select()
      .from(permissions)
      .where(like(permissions.name, `${resource}:%`));
  }

  async findByRole(
    roleId: string,
  ): Promise<(typeof permissions.$inferSelect)[]> {
    return this.db
      .select({
        permission: permissions,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId))
      .then((results) => results.map((r) => r.permission));
  }

  async search(query: string): Promise<(typeof permissions.$inferSelect)[]> {
    return this.db
      .select()
      .from(permissions)
      .where(
        or(
          like(permissions.name, `%${query}%`),
          like(permissions.description, `%${query}%`),
        ),
      );
  }
}

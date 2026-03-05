import { pgTable, uuid, primaryKey, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { AccessPermissions } from './access-permissions.sql';
import { timestamps } from '../helpers';
import { AccessRoles } from './access-roles.sql';

export const RolePermissions = pgTable(
  'access_role_permissions',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => AccessRoles.id, { onDelete: 'cascade' }),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => AccessPermissions.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
    roleIdIdx: index('idx_role_permissions_role_id').on(table.roleId),
    permissionIdIdx: index('idx_role_permissions_permission_id').on(
      table.permissionId,
    ),
  }),
);

export const rolePermissionsRelations = relations(
  RolePermissions,
  ({ one }) => ({
    role: one(AccessRoles, {
      fields: [RolePermissions.roleId],
      references: [AccessRoles.id],
    }),
    permission: one(AccessPermissions, {
      fields: [RolePermissions.permissionId],
      references: [AccessPermissions.id],
    }),
  }),
);

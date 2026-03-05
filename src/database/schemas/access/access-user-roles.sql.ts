import {
  pgTable,
  uuid,
  timestamp,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { AccessRoles } from './access-roles.sql';
import { User } from '../user/users.sql';
import { timestamps } from '../helpers';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import z from 'zod';

export const AccessUserRoles = pgTable(
  'access_user_roles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => User.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => AccessRoles.id, { onDelete: 'cascade' }),
    assignedBy: uuid('assigned_by').references(() => User.id, {
      onDelete: 'set null',
    }),
    assignedAt: timestamp('assigned_at').notNull().defaultNow(),
    expiresAt: timestamp('expires_at'),
    ...timestamps,
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.roleId] }),
    userIdIdx: index('idx_user_roles_user_id').on(table.userId),
    roleIdIdx: index('idx_user_roles_role_id').on(table.roleId),
    expiresAtIdx: index('idx_user_roles_expires_at').on(table.expiresAt),
  }),
);

export const userRolesRelations = relations(AccessUserRoles, ({ one }) => ({
  user: one(User, {
    fields: [AccessUserRoles.userId],
    references: [User.id],
  }),
  role: one(AccessRoles, {
    fields: [AccessUserRoles.roleId],
    references: [AccessRoles.id],
  }),
  assignedByUser: one(User, {
    fields: [AccessUserRoles.assignedBy],
    references: [User.id],
  }),
}));

export const selectAccessUserRoleSchema = createSelectSchema(AccessUserRoles);
export const insertAccessUserRoleSchema = createInsertSchema(AccessUserRoles);
export const updateAccessUserRoleSchema = createUpdateSchema(AccessUserRoles);

export type SelectAccessUserRole = z.infer<typeof selectAccessUserRoleSchema>;
export type InsertAccessUserRole = z.infer<typeof insertAccessUserRoleSchema>;
export type UpdateAccessUserRole = z.infer<typeof updateAccessUserRoleSchema>;

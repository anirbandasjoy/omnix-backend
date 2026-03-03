import { pgTable, uuid, varchar, text, index } from 'drizzle-orm/pg-core';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import z from 'zod';
import { timestamps } from '../helpers';

export const AccessPermissions = pgTable(
  'access_permissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    resource: varchar('resource', { length: 100 }).notNull(),
    action: varchar('action', { length: 50 }).notNull(),
    description: text('description'),
    ...timestamps,
  },
  (table) => ({
    slugIdx: index('idx_permissions_slug').on(table.slug),
    resourceIdx: index('idx_permissions_resource').on(table.resource),
    actionIdx: index('idx_permissions_action').on(table.action),
    resourceActionIdx: index('idx_permissions_resource_action').on(
      table.resource,
      table.action,
    ),
  }),
);

export const selectAccessPermissionSchema =
  createSelectSchema(AccessPermissions);
export const insertAccessPermissionSchema =
  createInsertSchema(AccessPermissions);
export const updateAccessPermissionSchema =
  createUpdateSchema(AccessPermissions);

export type SelectAccessPermission = z.infer<
  typeof selectAccessPermissionSchema
>;
export type InsertAccessPermission = z.infer<
  typeof insertAccessPermissionSchema
>;
export type UpdateAccessPermission = z.infer<
  typeof updateAccessPermissionSchema
>;

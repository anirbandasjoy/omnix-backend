import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { timestamps } from '../helpers';
import { UserRoleLevel, UserRoleLevelEnum } from '../enums/user-enum.sql';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import z from 'zod';

export const AccessRoles = pgTable(
  'access_roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    description: text('description'),
    level: UserRoleLevelEnum('level')
      .notNull()
      .default('user' as UserRoleLevel),
    isSystem: boolean('is_system').notNull().default(false),
    ...timestamps,
  },
  (table) => ({
    slugIdx: index('idx_roles_slug').on(table.slug),
    levelIdx: index('idx_roles_level').on(table.level),
    isSystemIdx: index('idx_roles_is_system').on(table.isSystem),
  }),
);

export const selectAccessRoleSchema = createSelectSchema(AccessRoles);
export const insertAccessRoleSchema = createInsertSchema(AccessRoles);
export const updateAccessRoleSchema = createUpdateSchema(AccessRoles);

export type SelectAccessRole = z.infer<typeof selectAccessRoleSchema>;
export type InsertAccessRole = z.infer<typeof insertAccessRoleSchema>;
export type UpdateAccessRole = z.infer<typeof updateAccessRoleSchema>;

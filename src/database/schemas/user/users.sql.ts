import { pgTable, uuid, boolean, index } from 'drizzle-orm/pg-core';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { entityStateFields, timestamps } from '../helpers';
import z from 'zod';

export const User = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    status: boolean('status').notNull().default(true),
    emailVerified: boolean('email_verified').notNull().default(false),
    phoneVerified: boolean('phone_verified').notNull().default(false),
    ...entityStateFields,
    ...timestamps,
  },
  (table) => ({
    statusIdx: index('idx_users_status').on(table.status),
    isDeletedIdx: index('idx_users_is_deleted').on(table.isDeleted),
    deletedAtIdx: index('idx_users_deleted_at').on(table.deletedAt),
  }),
);

export const selectUserSchema = createSelectSchema(User);
export const insertUserSchema = createInsertSchema(User);
export const updateUserSchema = createUpdateSchema(User);

export type SelectUser = z.infer<typeof selectUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

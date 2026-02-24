import { pgTable, uuid, boolean, timestamp, index } from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    status: boolean('status').notNull().default(true),
    emailVerified: boolean('email_verified').notNull().default(false),
    phoneVerified: boolean('phone_verified').notNull().default(false),
    isDeleted: boolean('is_deleted').notNull().default(false),
    deletedAt: timestamp('deleted_at'),
    recoveredAt: timestamp('recovered_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index('idx_users_status').on(table.status),
    isDeletedIdx: index('idx_users_is_deleted').on(table.isDeleted),
    deletedAtIdx: index('idx_users_deleted_at').on(table.deletedAt),
  }),
);

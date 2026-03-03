import { boolean, timestamp } from 'drizzle-orm/pg-core';

export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .$onUpdate(() => new Date().toISOString())
    .notNull(),
};

export const entityStateFields = {
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
  revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'string' }),
  isDeleted: boolean('is_deleted').notNull().default(false),
};

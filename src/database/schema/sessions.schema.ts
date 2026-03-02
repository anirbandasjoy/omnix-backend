import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { devices } from './devices.schema';

export const sessions = pgTable(
  'user_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    deviceId: uuid('device_id')
      .notNull()
      .references(() => devices.id, { onDelete: 'set null' }),
    token: text('token').notNull().unique(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    location: jsonb('location'),
    isActive: boolean('is_active').notNull().default(true),
    lastActivity: timestamp('last_activity').notNull().defaultNow(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_sessions_user_id').on(table.userId),
    deviceIdIdx: index('idx_sessions_device_id').on(table.deviceId),
    isActiveIdx: index('idx_sessions_is_active').on(table.isActive),
    userIdActiveIdx: index('idx_sessions_user_id_active').on(
      table.userId,
      table.isActive,
    ),
    expiresAtIdx: index('idx_sessions_expires_at').on(table.expiresAt),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
  device: one(devices, {
    fields: [sessions.deviceId],
    references: [devices.id],
  }),
}));

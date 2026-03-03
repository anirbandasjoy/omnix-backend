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
import { User } from '../user/users.sql';
import { AuthDevices } from './auth-devices.sql';
import { timestamps } from '../helpers';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import z from 'zod';

export const AuthSessions = pgTable(
  'auth_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => User.id, { onDelete: 'cascade' }),
    deviceId: uuid('device_id')
      .notNull()
      .references(() => AuthDevices.id, { onDelete: 'set null' }),
    token: text('token').notNull().unique(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    location: jsonb('location'),
    isActive: boolean('is_active').notNull().default(true),
    lastActivity: timestamp('last_activity').notNull().defaultNow(),
    expiresAt: timestamp('expires_at').notNull(),
    ...timestamps,
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

export const sessionsRelations = relations(AuthSessions, ({ one }) => ({
  user: one(User, {
    fields: [AuthSessions.userId],
    references: [User.id],
  }),
  device: one(AuthDevices, {
    fields: [AuthSessions.deviceId],
    references: [AuthDevices.id],
  }),
}));

export const selectAuthSessionSchema = createSelectSchema(AuthSessions);
export const insertAuthSessionSchema = createInsertSchema(AuthSessions);
export const updateAuthSessionSchema = createUpdateSchema(AuthSessions);

export type SelectAuthSession = z.infer<typeof selectAuthSessionSchema>;
export type InsertAuthSession = z.infer<typeof insertAuthSessionSchema>;
export type UpdateAuthSession = z.infer<typeof updateAuthSessionSchema>;

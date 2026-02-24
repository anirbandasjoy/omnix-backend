import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { devices } from './devices.schema';

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    deviceId: uuid('device_id')
      .notNull()
      .references(() => devices.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    isRevoked: boolean('is_revoked').notNull().default(false),
    revokedAt: timestamp('revoked_at'),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_refresh_tokens_user_id').on(table.userId),
    deviceIdIdx: index('idx_refresh_tokens_device_id').on(table.deviceId),
    tokenIdx: index('idx_refresh_tokens_token').on(table.token),
    expiresAtIdx: index('idx_refresh_tokens_expires_at').on(table.expiresAt),
    isRevokedIdx: index('idx_refresh_tokens_is_revoked').on(table.isRevoked),
    userIdRevokedIdx: index('idx_refresh_tokens_user_id_revoked').on(
      table.userId,
      table.isRevoked,
    ),
  }),
);

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
  device: one(devices, {
    fields: [refreshTokens.deviceId],
    references: [devices.id],
  }),
}));

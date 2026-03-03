import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
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

export const AuthRefreshTokens = pgTable(
  'auth_refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => User.id, { onDelete: 'cascade' }),
    deviceId: uuid('device_id')
      .notNull()
      .references(() => AuthDevices.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    isRevoked: boolean('is_revoked').notNull().default(false),
    revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'string' }),
    expiresAt: timestamp('expires_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    ...timestamps,
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

export const refreshTokensRelations = relations(
  AuthRefreshTokens,
  ({ one }) => ({
    user: one(User, {
      fields: [AuthRefreshTokens.userId],
      references: [User.id],
    }),
    device: one(AuthDevices, {
      fields: [AuthRefreshTokens.deviceId],
      references: [AuthDevices.id],
    }),
  }),
);

export const selectAuthRefreshTokenSchema =
  createSelectSchema(AuthRefreshTokens);
export const insertAuthRefreshTokenSchema =
  createInsertSchema(AuthRefreshTokens);
export const updateAuthRefreshTokenSchema =
  createUpdateSchema(AuthRefreshTokens);

export type SelectAuthRefreshToken = z.infer<
  typeof selectAuthRefreshTokenSchema
>;
export type InsertAuthRefreshToken = z.infer<
  typeof insertAuthRefreshTokenSchema
>;
export type UpdateAuthRefreshToken = z.infer<
  typeof updateAuthRefreshTokenSchema
>;

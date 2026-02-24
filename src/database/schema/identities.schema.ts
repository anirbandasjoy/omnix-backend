import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';

export const identities = pgTable(
  'identities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: varchar('provider', {
      length: 50,
      enum: ['email', 'phone', 'username', 'google', 'github'],
    }).notNull(),
    providerId: varchar('provider_id', { length: 255 }).notNull(),
    password: text('password'),
    isVerified: boolean('is_verified').notNull().default(false),
    isPrimary: boolean('is_primary').notNull().default(false),
    oauthAccessToken: text('oauth_access_token'),
    oauthRefreshToken: text('oauth_refresh_token'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_identities_user_id').on(table.userId),
    providerIdx: index('idx_identities_provider').on(table.provider),
    providerIdIdx: index('idx_identities_provider_id').on(table.providerId),
    isVerifiedIdx: index('idx_identities_is_verified').on(table.isVerified),
    isPrimaryIdx: index('idx_identities_is_primary').on(table.isPrimary),
    uniqueProvider: index('idx_identities_unique_provider').on(
      table.userId,
      table.provider,
      table.providerId,
    ),
  }),
);

export const identitiesRelations = relations(identities, ({ one }) => ({
  user: one(users, {
    fields: [identities.userId],
    references: [users.id],
  }),
}));

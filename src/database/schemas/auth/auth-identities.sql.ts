import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  index,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { User } from '../user/users.sql';
import { timestamps } from '../helpers';
import { IdentityProviderEnum } from '../enums/user-enum.sql';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import z from 'zod';

export const AuthIdentities = pgTable(
  'auth_identities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => User.id, { onDelete: 'cascade' }),
    provider: IdentityProviderEnum('provider').notNull(),
    providerId: varchar('provider_id', { length: 255 }).notNull(),
    secret: text('secret'),
    isVerified: boolean('is_verified').notNull().default(false),
    isPrimary: boolean('is_primary').notNull().default(false),
    metadata: jsonb('metadata').$type<Record<any, any>>(),
    ...timestamps,
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

export const identitiesRelations = relations(AuthIdentities, ({ one }) => ({
  user: one(User, {
    fields: [AuthIdentities.userId],
    references: [User.id],
  }),
}));

export const selectAuthIdentitySchema = createSelectSchema(AuthIdentities);
export const insertAuthIdentitySchema = createInsertSchema(AuthIdentities);
export const updateAuthIdentitySchema = createUpdateSchema(AuthIdentities);

export type SelectAuthIdentity = z.infer<typeof selectAuthIdentitySchema>;
export type InsertAuthIdentity = z.infer<typeof insertAuthIdentitySchema>;
export type UpdateAuthIdentity = z.infer<typeof updateAuthIdentitySchema>;

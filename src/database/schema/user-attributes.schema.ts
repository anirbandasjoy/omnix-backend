import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  primaryKey,
  index,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';

export const userAttributes = pgTable(
  'user_attributes',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    key: varchar('key', { length: 100 }).notNull(),
    value: text('value').notNull(),
    type: varchar('type', {
      length: 20,
      enum: ['string', 'number', 'boolean', 'json'],
    })
      .notNull()
      .default('string'),
    isPublic: boolean('is_public').notNull().default(false),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.key] }),
    userIdIdx: index('idx_user_attributes_user_id').on(table.userId),
    keyIdx: index('idx_user_attributes_key').on(table.key),
    isPublicIdx: index('idx_user_attributes_is_public').on(table.isPublic),
  }),
);

export const userAttributesRelations = relations(userAttributes, ({ one }) => ({
  user: one(users, {
    fields: [userAttributes.userId],
    references: [users.id],
  }),
}));

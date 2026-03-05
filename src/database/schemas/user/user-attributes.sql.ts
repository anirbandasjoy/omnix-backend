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
import { User } from './users.sql';
import { timestamps } from '../helpers';
import { UserAttributeTypeEnum } from '../enums/user-enum.sql';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import z from 'zod';

export const UserAttributes = pgTable(
  'user_attributes',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => User.id, { onDelete: 'cascade' }),
    key: varchar('key', { length: 100 }).notNull(),
    value: text('value').notNull(),
    type: UserAttributeTypeEnum('type').notNull(),
    isPublic: boolean('is_public').notNull().default(false),
    ...timestamps,
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.key] }),
    userIdIdx: index('idx_user_attributes_user_id').on(table.userId),
    keyIdx: index('idx_user_attributes_key').on(table.key),
    isPublicIdx: index('idx_user_attributes_is_public').on(table.isPublic),
  }),
);

export const userAttributesRelations = relations(UserAttributes, ({ one }) => ({
  user: one(User, {
    fields: [UserAttributes.userId],
    references: [User.id],
  }),
}));

export const selectUserAttributeSchema = createSelectSchema(UserAttributes);
export const insertUserAttributeSchema = createInsertSchema(UserAttributes);
export const updateUserAttributeSchema = createUpdateSchema(UserAttributes);

export type SelectUserAttribute = z.infer<typeof selectUserAttributeSchema>;
export type InsertUserAttribute = z.infer<typeof insertUserAttributeSchema>;
export type UpdateUserAttribute = z.infer<typeof updateUserAttributeSchema>;

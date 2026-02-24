import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';

export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    displayName: varchar('display_name', { length: 255 }),
    bio: text('bio'),
    avatarId: uuid('avatar_id'),
    dateOfBirth: date('date_of_birth'),
    gender: varchar('gender', {
      length: 50,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    }),
    phoneNumber: varchar('phone_number', { length: 20 }),
    address: text('address'),
    city: varchar('city', { length: 100 }),
    country: varchar('country', { length: 100 }),
    postalCode: varchar('postal_code', { length: 20 }),
    preferences: text('preferences'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_profiles_user_id').on(table.userId),
    avatarIdIdx: index('idx_profiles_avatar_id').on(table.avatarId),
  }),
);

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

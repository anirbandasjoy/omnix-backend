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
import { User } from './users.sql';
import { timestamps } from '../helpers';
import { Asset } from '../asset/assets.schema';
import { GenderEnum } from '../enums/user-enum.sql';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import z from 'zod';

export const UserProfile = pgTable(
  'user_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => User.id, { onDelete: 'cascade' }),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    displayName: varchar('display_name', { length: 255 }),
    bio: text('bio'),
    avatarId: uuid('avatar_id').references(() => Asset.id, {
      onDelete: 'set null',
    }),
    dateOfBirth: date('date_of_birth'),
    gender: GenderEnum('gender'),
    phoneNumber: varchar('phone_number', { length: 20 }),
    address: text('address'),
    city: varchar('city', { length: 100 }),
    country: varchar('country', { length: 100 }),
    postalCode: varchar('postal_code', { length: 20 }),
    preferences: text('preferences'),
    ...timestamps,
  },
  (table) => ({
    userIdIdx: index('idx_profiles_user_id').on(table.userId),
    avatarIdIdx: index('idx_profiles_avatar_id').on(table.avatarId),
  }),
);

export const profilesRelations = relations(UserProfile, ({ one }) => ({
  user: one(User, {
    fields: [UserProfile.userId],
    references: [User.id],
  }),
  avatar: one(Asset, {
    fields: [UserProfile.avatarId],
    references: [Asset.id],
  }),
}));

export const selectUserProfileSchema = createSelectSchema(UserProfile);
export const insertUserProfileSchema = createInsertSchema(UserProfile);
export const updateUserProfileSchema = createUpdateSchema(UserProfile);

export type SelectUserProfile = z.infer<typeof selectUserProfileSchema>;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;

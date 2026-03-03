import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { User } from './users.sql';
import { timestamps } from '../helpers';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import z from 'zod';
import { UserActivityTypeEnum } from '../enums/user-enum.sql';

export const UserActivities = pgTable(
  'user_activities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => User.id, {
      onDelete: 'set null',
    }),
    type: UserActivityTypeEnum('type').notNull(),
    action: varchar('action', { length: 100 }).notNull(),
    description: text('description'),
    metadata: jsonb('metadata'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    ...timestamps,
  },
  (table) => ({
    userIdIdx: index('idx_activities_user_id').on(table.userId),
    typeIdx: index('idx_activities_type').on(table.type),
    actionIdx: index('idx_activities_action').on(table.action),
    userIdActionIdx: index('idx_activities_user_id_action').on(
      table.userId,
      table.action,
    ),
    createdAtIdx: index('idx_activities_created_at').on(table.createdAt),
  }),
);

export const activitiesRelations = relations(UserActivities, ({ one }) => ({
  user: one(User, {
    fields: [UserActivities.userId],
    references: [User.id],
  }),
}));

export const selectUserActivitySchema = createSelectSchema(UserActivities);
export const insertUserActivitySchema = createInsertSchema(UserActivities);
export const updateUserActivitySchema = createUpdateSchema(UserActivities);

export type SelectUserActivity = z.infer<typeof selectUserActivitySchema>;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;
export type UpdateUserActivity = z.infer<typeof updateUserActivitySchema>;

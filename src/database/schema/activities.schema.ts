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
import { users } from './users.schema';

export const activities = pgTable(
  'activities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    type: varchar('type', { length: 50 }).notNull(),
    action: varchar('action', { length: 100 }).notNull(),
    description: text('description'),
    metadata: jsonb('metadata'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
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

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

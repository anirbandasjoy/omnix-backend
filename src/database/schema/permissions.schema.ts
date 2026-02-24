import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const permissions = pgTable(
  'permissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    resource: varchar('resource', { length: 100 }).notNull(),
    action: varchar('action', { length: 50 }).notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: index('idx_permissions_slug').on(table.slug),
    resourceIdx: index('idx_permissions_resource').on(table.resource),
    actionIdx: index('idx_permissions_action').on(table.action),
    resourceActionIdx: index('idx_permissions_resource_action').on(
      table.resource,
      table.action,
    ),
  }),
);

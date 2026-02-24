import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const roles = pgTable(
  'roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    description: text('description'),
    level: varchar('level', {
      length: 50,
      enum: ['system', 'organization', 'user'],
    }).notNull(),
    isSystem: boolean('is_system').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: index('idx_roles_slug').on(table.slug),
    levelIdx: index('idx_roles_level').on(table.level),
    isSystemIdx: index('idx_roles_is_system').on(table.isSystem),
  }),
);

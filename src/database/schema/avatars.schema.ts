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

export const avatars = pgTable(
  'avatars',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    originalName: varchar('original_name', { length: 255 }).notNull(),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    filePath: text('file_path').notNull(),
    fileSize: varchar('file_size', { length: 50 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    width: varchar('width', { length: 10 }),
    height: varchar('height', { length: 10 }),
    cdnUrl: text('cdn_url'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
    deletedBy: uuid('deleted_by').references(() => users.id, {
      onDelete: 'set null',
    }),
  },
  (table) => ({
    userIdIdx: index('idx_avatars_user_id').on(table.userId),
    isActiveIdx: index('idx_avatars_is_active').on(table.isActive),
    hashIdx: index('idx_avatars_hash').on(table.fileName), // Using fileName as hash for now
  }),
);

export const avatarsRelations = relations(avatars, ({ one }) => ({
  user: one(users, {
    fields: [avatars.userId],
    references: [users.id],
  }),
  deletedByUser: one(users, {
    fields: [avatars.deletedBy],
    references: [users.id],
  }),
}));

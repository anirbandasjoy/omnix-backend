import { pgTable, uuid, varchar, text, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { entityStateFields, timestamps } from '../helpers';
import { User } from '../user/users.sql';
import z from 'zod';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';

export const Asset = pgTable(
  'assets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => User.id, { onDelete: 'cascade' }),
    originalName: varchar('original_name', { length: 255 }).notNull(),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    filePath: text('file_path').notNull(),
    fileSize: varchar('file_size', { length: 50 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    width: varchar('width', { length: 10 }),
    height: varchar('height', { length: 10 }),
    cdnUrl: text('cdn_url'),
    deletedBy: uuid('deleted_by').references(() => User.id, {
      onDelete: 'set null',
    }),
    ...entityStateFields,
    ...timestamps,
  },
  (table) => ({
    userIdIdx: index('idx_avatars_user_id').on(table.userId),
    isActiveIdx: index('idx_avatars_is_active').on(table.isDeleted),
    hashIdx: index('idx_avatars_hash').on(table.fileName),
  }),
);

export const avatarsRelations = relations(Asset, ({ one }) => ({
  user: one(User, {
    fields: [Asset.userId],
    references: [User.id],
  }),
  deletedByUser: one(User, {
    fields: [Asset.deletedBy],
    references: [User.id],
  }),
}));

export const selectAssetSchema = createSelectSchema(Asset);
export const insertAssetSchema = createInsertSchema(Asset);
export const updateAssetSchema = createUpdateSchema(Asset);

export type SelectAsset = z.infer<typeof selectAssetSchema>;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type UpdateAsset = z.infer<typeof updateAssetSchema>;

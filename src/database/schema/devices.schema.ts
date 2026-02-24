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

export const devices = pgTable(
  'devices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    deviceType: varchar('device_type', {
      length: 50,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    }).notNull(),
    deviceName: varchar('device_name', { length: 255 }),
    os: varchar('os', { length: 100 }),
    browser: varchar('browser', { length: 100 }),
    fingerprint: text('fingerprint').notNull(),
    isTrusted: boolean('is_trusted').notNull().default(false),
    lastSeen: timestamp('last_seen').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_devices_user_id').on(table.userId),
    fingerprintIdx: index('idx_devices_fingerprint').on(table.fingerprint),
    isTrustedIdx: index('idx_devices_is_trusted').on(table.isTrusted),
    uniqueFingerprint: index('idx_devices_unique_fingerprint').on(
      table.userId,
      table.fingerprint,
    ),
  }),
);

export const devicesRelations = relations(devices, ({ one }) => ({
  user: one(users, {
    fields: [devices.userId],
    references: [users.id],
  }),
}));

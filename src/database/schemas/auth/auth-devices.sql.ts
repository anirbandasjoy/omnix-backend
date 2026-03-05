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
import { User } from '../user/users.sql';
import { DeviceTypeEnum } from '../enums/user-enum.sql';
import { timestamps } from '../helpers';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import z from 'zod';

export const AuthDevices = pgTable(
  'auth_devices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => User.id, { onDelete: 'cascade' }),
    deviceType: DeviceTypeEnum('device_type').notNull(),
    deviceName: varchar('device_name', { length: 255 }),
    os: varchar('os', { length: 100 }),
    browser: varchar('browser', { length: 100 }),
    fingerprint: text('fingerprint').notNull(),
    isTrusted: boolean('is_trusted').notNull().default(false),
    lastSeen: timestamp('last_seen').notNull().defaultNow(),
    ...timestamps,
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

export const devicesRelations = relations(AuthDevices, ({ one }) => ({
  user: one(User, {
    fields: [AuthDevices.userId],
    references: [User.id],
  }),
}));

export const selectAuthDeviceSchema = createSelectSchema(AuthDevices);
export const insertAuthDeviceSchema = createInsertSchema(AuthDevices);
export const updateAuthDeviceSchema = createUpdateSchema(AuthDevices);

export type SelectAuthDevice = z.infer<typeof selectAuthDeviceSchema>;
export type InsertAuthDevice = z.infer<typeof insertAuthDeviceSchema>;
export type UpdateAuthDevice = z.infer<typeof updateAuthDeviceSchema>;

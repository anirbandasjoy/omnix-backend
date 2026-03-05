import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  index,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { User } from '../user/users.sql';
import { timestamps } from '../helpers';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import z from 'zod';
import {
  AuditLogCategoryEnum,
  AuditLogSeverityEnum,
  HttpMethodEnum,
} from '../enums/audit-enum.sql';

export const AuditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => User.id, {
      onDelete: 'set null',
    }),
    category: AuditLogCategoryEnum('category').notNull(),
    severity: AuditLogSeverityEnum('severity').notNull(),
    action: varchar('action', { length: 50 }).notNull(),
    entityType: varchar('entity_type', { length: 50 }),
    entityId: uuid('entity_id'),
    description: text('description'),
    metadata: jsonb('metadata'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    location: jsonb('location'),
    sessionId: uuid('session_id'),
    requestId: varchar('request_id', { length: 36 }),
    httpMethod: HttpMethodEnum('http_method'),
    statusCode: integer('status_code'),
    errorMessage: text('error_message'),
    duration: integer('duration'), // Duration in milliseconds
    ...timestamps,
  },
  (table) => ({
    // Single column indexes
    userIdIdx: index('idx_audit_logs_user_id').on(table.userId),
    categoryIdx: index('idx_audit_logs_category').on(table.category),
    severityIdx: index('idx_audit_logs_severity').on(table.severity),
    actionIdx: index('idx_audit_logs_action').on(table.action),
    createdAtIdx: index('idx_audit_logs_created_at').on(table.createdAt),

    // Composite indexes for common query patterns
    userIdCategoryIdx: index('idx_audit_logs_user_category').on(
      table.userId,
      table.category,
    ),
    userIdActionIdx: index('idx_audit_logs_user_action').on(
      table.userId,
      table.action,
    ),
    entityIdx: index('idx_audit_logs_entity').on(
      table.entityType,
      table.entityId,
    ),

    // Performance-critical composite indexes
    severityCreatedAtIdx: index('idx_audit_logs_severity_created').on(
      table.severity,
      table.createdAt,
    ),
    categorySeverityIdx: index('idx_audit_logs_category_severity').on(
      table.category,
      table.severity,
    ),
    categoryCreatedIdx: index('idx_audit_logs_category_created').on(
      table.category,
      table.createdAt,
    ),
  }),
);

export const auditLogsRelations = relations(AuditLogs, ({ one }) => ({
  user: one(User, {
    fields: [AuditLogs.userId],
    references: [User.id],
  }),
}));

export const selectAuditLogSchema = createSelectSchema(AuditLogs);
export const insertAuditLogSchema = createInsertSchema(AuditLogs);
export const updateAuditLogSchema = createUpdateSchema(AuditLogs);

export type SelectAuditLog = z.infer<typeof selectAuditLogSchema>;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type UpdateAuditLog = z.infer<typeof updateAuditLogSchema>;

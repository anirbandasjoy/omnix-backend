import { createResponseDto } from '@/core/builders';
import { selectAuditLogSchema } from '@/database/schemas';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const QueryAuditOptionsSchema = z.object({
  userId: z.string().uuid().optional(),
  category: z.string().optional(),
  severity: z.string().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  sessionId: z.string().uuid().optional(),
  requestId: z.string().optional(),
  httpMethod: z.string().optional(),
  statusCode: z.number().optional(),
  errorMessage: z.string().optional(),
  duration: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).optional(),
});

export class QueryAuditLogsDto extends createZodDto(QueryAuditOptionsSchema) {}

export class GetAuditLogDto extends createResponseDto(selectAuditLogSchema) {}

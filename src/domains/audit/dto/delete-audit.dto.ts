import { createResponseDto } from '@/core/builders';
import { selectAuditLogSchema } from '@/database/schemas';

import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const DeleteAuditLogSchema = z.object({
  id: z.string().uuid('Invalid UUID format for id'),
});

export class DeleteAuditLogParamDto extends createZodDto(
  DeleteAuditLogSchema,
) {}

export class DeleteAuditLogResponseDto extends createResponseDto(
  selectAuditLogSchema.pick({ id: true }),
) {}

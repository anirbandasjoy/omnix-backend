import { insertAuditLogSchema } from '@/database/schemas';
import { createZodDto } from 'nestjs-zod';

export class UpdateAuditLogDto extends createZodDto(insertAuditLogSchema) {}

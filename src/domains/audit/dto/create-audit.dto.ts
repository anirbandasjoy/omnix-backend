import { insertAuditLogSchema } from '@/database/schemas';
import { createZodDto } from 'nestjs-zod';

export class CreateAuditLogDto extends createZodDto(insertAuditLogSchema) {}

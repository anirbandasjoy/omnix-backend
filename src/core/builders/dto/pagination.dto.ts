import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .optional()
    .default(1)
    .describe('Page number (1-based)'),
  pageSize: z.coerce
    .number()
    .int()
    .min(0)
    .max(100)
    .optional()
    .default(10)
    .describe('Number of items per page (0 for no limit)'),
});

export class PaginationQueryDto extends createZodDto(PaginationQuerySchema) {}

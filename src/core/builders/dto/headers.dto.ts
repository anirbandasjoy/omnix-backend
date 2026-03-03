import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const headersSchema = z.object({
  'user-agent': z.string().optional(),
});

export class HeadersDto extends createZodDto(headersSchema) {}

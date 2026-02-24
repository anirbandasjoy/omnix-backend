import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Schema for individual field errors
 */
export const FieldErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string().optional(),
});

export class FieldErrorDto extends createZodDto(FieldErrorSchema) {
  @ApiProperty({ example: 'email' })
  field!: string;

  @ApiProperty({ example: 'Invalid email format' })
  message!: string;

  @ApiPropertyOptional({ example: 'INVALID_EMAIL' })
  code?: string;
}

/**
 * Schema for error responses
 */
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  statusCode: z.number(),
  message: z.string(),
  errors: z.array(FieldErrorSchema).optional(),
  path: z.string().optional(),
  method: z.string().optional(),
  timestamp: z.string(),
  correlationId: z.string().optional(),
});

export class ErrorResponseDto extends createZodDto(ErrorResponseSchema) {
  @ApiProperty({ example: false })
  success!: false;

  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: 'Validation failed' })
  message!: string;

  @ApiPropertyOptional({
    type: [FieldErrorDto],
    example: [
      {
        field: 'email',
        message: 'Invalid email format',
        code: 'INVALID_EMAIL',
      },
    ],
  })
  errors?: FieldErrorDto[];

  @ApiPropertyOptional({ example: '/api/v1/auth/register' })
  path?: string;

  @ApiPropertyOptional({ example: 'POST' })
  method?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp!: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  correlationId?: string;
}

/**
 * Schema for successful API responses
 */
export const SuccessResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    statusCode: z.number(),
    message: z.string(),
    data: dataSchema,
    timestamp: z.string(),
  });

/**
 * Schema for paginated responses
 */
export const PaginatedResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    statusCode: z.number(),
    message: z.string(),
    data: z.array(dataSchema),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
    timestamp: z.string(),
  });

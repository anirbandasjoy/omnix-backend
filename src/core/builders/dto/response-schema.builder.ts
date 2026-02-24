import { createZodDto } from 'nestjs-zod';
import { z, ZodType } from 'zod';

/**
 * Standard API Response Schema
 * Matches the ResponseTransformInterceptor output format
 */
export const StandardResponseSchema = <T extends ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    statusCode: z.number(),
    message: z.string(),
    data: dataSchema,
    meta: z.record(z.string(), z.any()).optional(),
    pagination: z
      .object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
      })
      .optional(),
    timestamp: z.string(),
    path: z.string().optional(),
  });

/**
 * Pagination Meta Schema
 */
export const PaginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

/**
 * Build a standard response schema with data
 */
export const buildResponseSchema = <T extends ZodType>(dataSchema: T) => {
  return z.object({
    success: z.literal(true),
    statusCode: z.number(),
    message: z.string(),
    data: dataSchema,
    meta: z.record(z.string(), z.any()).optional(),
    timestamp: z.string(),
    path: z.string().optional(),
  });
};

/**
 * Build a paginated response schema
 */
export const buildPaginatedResponseSchema = <T extends ZodType>(
  dataSchema: T,
) => {
  return z.object({
    success: z.literal(true),
    statusCode: z.number(),
    message: z.string(),
    data: z.array(dataSchema),
    pagination: PaginationMetaSchema,
    timestamp: z.string(),
    path: z.string().optional(),
  });
};

/**
 * Create a response DTO from a data schema
 */
export const createResponseDto = <T extends ZodType>(dataSchema: T) => {
  return createZodDto(buildResponseSchema(dataSchema));
};

/**
 * Create a paginated response DTO from a data schema
 */
export const createPaginatedResponseDto = <T extends ZodType>(
  dataSchema: T,
) => {
  return createZodDto(buildPaginatedResponseSchema(dataSchema));
};

/**
 * Serialize pagination metadata
 */
export const serializePagination = (
  pagination: Omit<PaginationMeta, 'totalPages'>,
): PaginationMeta => {
  const { page, limit, total } = pagination;
  const totalPages = limit === 0 ? 1 : Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
  };
};

/**
 * Create a standard success response object
 * Use this in services or controllers to create consistent responses
 */
export const createSuccessResponse = <T = unknown>(
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: Record<string, unknown>,
) => {
  return {
    success: true as const,
    statusCode,
    message,
    data,
    meta: meta || {},
    timestamp: new Date().toISOString(),
  };
};

/**
 * Create a paginated response object
 */
export const createPaginatedResponse = <T = unknown>(
  data: T[],
  pagination: Omit<PaginationMeta, 'totalPages'>,
  message = 'Data retrieved successfully',
  statusCode = 200,
) => {
  return {
    success: true as const,
    statusCode,
    message,
    data,
    pagination: serializePagination(pagination),
    timestamp: new Date().toISOString(),
  };
};

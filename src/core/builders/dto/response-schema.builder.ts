import { createZodDto } from 'nestjs-zod';
import { z, ZodType } from 'zod';

const PaginationMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number().optional(),
});
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

const MetaSchema = z.object({
  pagination: PaginationMetaSchema,
});

export type Meta = z.infer<typeof MetaSchema>;

export const buildResponseSchema = <T extends ZodType, M extends ZodType>(
  resultsSchema: T,
  metaSchema?: M,
) => {
  const meta =
    metaSchema ?? (MetaSchema.omit({ pagination: true }) as unknown as M);
  return z.object({
    statusCode: z.number(),
    message: z.string(),
    results: resultsSchema,
    meta: meta,
  });
};

export const buildPaginatedResponseSchema = <
  T extends ZodType,
  M extends ZodType,
>(
  resultsSchema: T,
  metaSchema?: M,
) => {
  const meta = metaSchema ? MetaSchema.extend(metaSchema) : MetaSchema;
  return z.object({
    statusCode: z.number(),
    results: z.array(resultsSchema),
    message: z.string(),
    meta: meta,
  });
};

export const createResponseDto = <T extends ZodType>(resultsSchema: T) => {
  return createZodDto(buildResponseSchema(resultsSchema));
};

export const createPaginatedResponseDto = <T extends ZodType>(
  resultsSchema: T,
) => {
  return createZodDto(buildPaginatedResponseSchema(resultsSchema));
};

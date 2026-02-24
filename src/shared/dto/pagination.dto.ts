import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

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
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .describe('Number of items per page'),
  sortBy: z.string().optional().describe('Field to sort by'),
  sortOrder: z.enum(['asc', 'desc']).optional().describe('Sort order'),
  search: z.string().optional().describe('Search term'),
});

export class PaginationQueryDto extends createZodDto(PaginationQuerySchema) {
  @ApiProperty({
    example: 1,
    minimum: 1,
    default: 1,
    description: 'Page number (1-based)',
    required: false,
  })
  page: number;

  @ApiProperty({
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
    description: 'Number of items per page',
    required: false,
  })
  pageSize: number;

  @ApiPropertyOptional({
    example: 'createdAt',
    description: 'Field to sort by',
  })
  sortBy?: string;

  @ApiPropertyOptional({
    enum: SortOrder,
    example: SortOrder.DESC,
    description: 'Sort order',
  })
  sortOrder?: SortOrder;

  @ApiPropertyOptional({
    example: 'john',
    description: 'Search term to filter results',
  })
  search?: string;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 100, description: 'Total number of items' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of items per page' })
  limit: number;

  @ApiProperty({
    example: 10,
    description: 'Total number of pages',
  })
  totalPages: number;

  @ApiProperty({ example: true, description: 'Whether there is a next page' })
  hasNext: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether there is a previous page',
  })
  hasPrev: boolean;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of items',
    isArray: true,
  })
  data: T[];

  @ApiProperty({
    type: PaginationMetaDto,
    description: 'Pagination metadata',
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

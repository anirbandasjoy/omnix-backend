/**
 * Pagination DTO
 */
export interface PaginationDto {
  page?: number;
  limit?: number;
  cursor?: string;
}

/**
 * Base response DTO
 */
export interface BaseResponseDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Omit utility helper for nested types
 */
export type OmitId<T> = Omit<T, 'id'>;
export type OmitTimestamps<T> = Omit<T, 'createdAt' | 'updatedAt'>;
export type OmitSensitive<T> = Omit<
  T,
  'password' | 'passwordHash' | 'oauthAccessToken' | 'oauthRefreshToken'
>;

/**
 * Generic filter type for queries
 */
export interface FilterDto {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Generic DTO utilities (using drizzle-zod pattern)
 * These should be created using drizzle-zod in each schema file
 */
export type InsertDTO<T> = Omit<
  {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? never : T[K];
  },
  'id' | 'createdAt' | 'updatedAt'
>;

export type UpdateDTO<T> = Partial<Omit<InsertDTO<T>, 'userId'>>;

export type SelectDTO<T> = Omit<
  {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? never : T[K];
  },
  'password' | 'passwordHash' // Exclude sensitive fields by default
>;

/**
 * Helper to create partial update DTO
 */
export type PartialUpdateDTO<T> = Partial<UpdateDTO<T>>;

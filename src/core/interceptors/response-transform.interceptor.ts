import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Optional,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { SKIP_RESPONSE_TRANSFORM_KEY } from '../decorators';
import type { Request, Response } from 'express';
import { type PaginationMeta } from '../builders/dto/response-schema.builder';

/**
 * Standard API Response Interface
 * This matches the response format expected by the frontend
 */
export interface StandardResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
  pagination?: PaginationMeta;
  timestamp: string;
  path?: string;
}

/**
 * Paginated data structure
 */
interface PaginatedData<T> {
  data: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
  };
  message?: string;
}

/**
 * Data wrapper for flexible response structures
 */
interface DataWrapper<T> {
  data?: T;
  message?: string;
  meta?: Record<string, unknown>;
  success?: boolean;
  statusCode?: number;
  [key: string]: unknown;
}

/**
 * Type guard to check if data is paginated
 */
function isPaginatedData<T>(data: unknown): data is PaginatedData<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    'pagination' in data
  );
}

/**
 * Type guard to check if data is already a StandardResponse
 */
function isStandardResponse<T>(data: unknown): data is StandardResponse<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    'statusCode' in data &&
    'timestamp' in data
  );
}

/**
 * Type guard to check if data is a DataWrapper
 */
function isDataWrapper<T>(data: unknown): data is DataWrapper<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('data' in data || 'message' in data || 'meta' in data)
  );
}

/**
 * Response Transform Interceptor
 * Automatically wraps all controller responses in a standard format
 *
 * @example
 * // Controller returns:
 * { message: 'User created', data: { id: 1, name: 'John' } }
 *
 * // Transformed to:
 * {
 *   success: true,
 *   statusCode: 200,
 *   message: 'User created',
 *   data: { id: 1, name: 'John' },
 *   timestamp: '2024-01-01T00:00:00.000Z',
 *   path: '/api/v1/users'
 * }
 */
@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  StandardResponse<T>
> {
  constructor(@Optional() private readonly reflector?: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<StandardResponse<T>> {
    // Check if response transformation should be skipped
    const skipTransform = this.reflector?.get<boolean>(
      SKIP_RESPONSE_TRANSFORM_KEY,
      context.getHandler(),
    );

    if (skipTransform) {
      return next.handle() as Observable<StandardResponse<T>>;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data: unknown): StandardResponse<T> => {
        // If data already has the standard response format, return as-is
        if (isStandardResponse<T>(data)) {
          return data;
        }

        // Handle paginated response types using type guard
        if (isPaginatedData<T>(data)) {
          return this.buildPaginatedResponse(
            data.data,
            data.pagination,
            data.message,
            statusCode,
            request.url,
          );
        }

        // Handle wrapped data with message/data/meta structure
        if (isDataWrapper<T>(data)) {
          return this.buildStandardResponse(data, statusCode, request.url);
        }

        // Handle plain data
        return this.buildStandardResponsePlain(
          data as T,
          statusCode,
          request.url,
        );
      }),
    );
  }

  /**
   * Build a standard response object from wrapped data
   */
  private buildStandardResponse<T>(
    data: DataWrapper<T>,
    statusCode: number,
    path?: string,
  ): StandardResponse<T> {
    const hasMessage =
      typeof data.message === 'string' && data.message.length > 0;
    const hasData = 'data' in data;
    const hasMeta = data.meta && typeof data.meta === 'object';

    return {
      success: true,
      statusCode,
      message: hasMessage ? data.message! : 'Request successful',
      data: hasData ? (data.data as T) : (data as unknown as T),
      meta: hasMeta ? data.meta : undefined,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Build a standard response object from plain data
   */
  private buildStandardResponsePlain<T>(
    data: T,
    statusCode: number,
    path?: string,
  ): StandardResponse<T> {
    return {
      success: true,
      statusCode,
      message: 'Request successful',
      data,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Build a paginated response object
   */
  private buildPaginatedResponse<T>(
    data: T,
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages?: number;
    },
    message: string | undefined,
    statusCode: number,
    path?: string,
  ): StandardResponse<T> {
    const { page, limit, total, totalPages: providedTotalPages } = pagination;
    const totalPages =
      providedTotalPages ?? (limit === 0 ? 1 : Math.ceil(total / limit));

    return {
      success: true,
      statusCode,
      message: message ?? 'Data retrieved successfully',
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      timestamp: new Date().toISOString(),
      path,
    };
  }
}

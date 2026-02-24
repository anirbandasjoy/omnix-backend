import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of, tap } from 'rxjs';
import { Reflector } from '@nestjs/core';
import type { Cache } from 'cache-manager';

export const CACHE_KEY_METADATA = 'cacheKey';
export const CACHE_TTL_METADATA = 'cacheTtl';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject('CACHE_MANAGER') private readonly cacheManager: Cache,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const cacheKey = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );
    const cacheTtl = this.reflector.get<number>(
      CACHE_TTL_METADATA,
      context.getHandler(),
    );

    if (!cacheKey) {
      return next.handle();
    }

    // Try to get from cache
    const cachedValue = await this.cacheManager.get<unknown>(cacheKey);
    if (cachedValue !== undefined) {
      return of(cachedValue);
    }

    // Execute and cache result
    return next.handle().pipe(
      tap((data) => {
        // Non-blocking cache set - fire and forget
        void this.cacheManager.set(cacheKey, data, cacheTtl);
      }),
    );
  }
}

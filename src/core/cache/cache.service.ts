import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.cache.get(key);
    return value as T | undefined;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cache.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cache.del(key);
  }

  delPattern(pattern: string): void {
    // Redis pattern-based deletion - requires native Redis client
    // For now, this is a simplified implementation
    // TODO: Implement pattern-based deletion with Redis client
    console.warn(`delPattern called for pattern: ${pattern} - not implemented`);
  }

  async exists(key: string): Promise<boolean> {
    const value = await this.cache.get(key);
    return value !== undefined;
  }

  ttl(): number {
    // Cache manager v6 doesn't expose TTL directly
    // This would need Redis client access in production
    return -1;
  }

  async increment(key: string, by = 1): Promise<number> {
    const current = (await this.get<number>(key)) || 0;
    await this.set(key, current + by);
    return current + by;
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  async remember<T>(
    key: string,
    ttl: number,
    factory: () => Promise<T>,
  ): Promise<T> {
    return this.getOrSet(key, factory, ttl);
  }

  async flush(): Promise<void> {
    // Cache manager v6 renamed reset to clear
    await this.cache.clear?.();
  }
}

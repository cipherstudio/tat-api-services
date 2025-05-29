import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    try {
      // The reset method is not available in the newer cache-manager
      // We'll use a different approach to clear the cache
      if (typeof this.cacheManager['store']?.reset === 'function') {
        await this.cacheManager['store'].reset();
      } else {
        this.logger.warn(
          'Cache reset not supported with current cache manager. Implement alternative if needed.',
        );
      }
    } catch (error) {
      this.logger.error('Failed to reset cache', error);
    }
  }

  generateKey(prefix: string, identifier: string | number): string {
    return `${prefix}:${identifier}`;
  }

  generateListKey(prefix: string, params?: string): string {
    return params ? `${prefix}:list:${params}` : `${prefix}:list`;
  }
}

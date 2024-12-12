import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly DEFAULT_TTL = 3600; // 1 hour in seconds

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private ensurePositiveInteger(ttl: number): number {
    return Math.max(1, Math.floor(ttl));
  }

  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  async set(
    key: string,
    value: any,
    ttl: number = this.DEFAULT_TTL,
  ): Promise<void> {
    await this.cacheManager.set(key, value, this.ensurePositiveInteger(ttl));
  }

  async delete(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL,
  ): Promise<T> {
    return await this.cacheManager.wrap(
      key,
      fn,
      this.ensurePositiveInteger(ttl),
    );
  }

  async mget(...keys: string[]): Promise<any[]> {
    return await this.cacheManager.store.mget(...keys);
  }

  async mset(
    keyValuePairs: [string, any][],
    ttl: number = this.DEFAULT_TTL,
  ): Promise<void> {
    await this.cacheManager.store.mset(
      keyValuePairs,
      this.ensurePositiveInteger(ttl),
    );
  }
}

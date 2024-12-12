import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { CacheService } from '../../services/cache.service';

@Injectable()
export class CacheHealthIndicator extends HealthIndicator {
  constructor(private readonly cacheService: CacheService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Try to set and get a value to verify cache is working
      const testKey = 'health-check-test';
      await this.cacheService.set(testKey, 'test', 10);
      const value = await this.cacheService.get(testKey);

      if (value !== 'test') {
        throw new Error('Cache read/write test failed');
      }

      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError(
        'Cache check failed',
        this.getStatus(key, false, { message: error.message }),
      );
    }
  }
}

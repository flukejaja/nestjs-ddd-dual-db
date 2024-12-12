import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { CacheService } from '../services/cache.service';

@Injectable()
export class CacheHealthIndicator extends HealthIndicator {
  constructor(private readonly cacheService: CacheService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.cacheService.get('health-check');
      return this.getStatus(key, true);
    } catch (e) {
      return this.getStatus(key, false, { message: e.message });
    }
  }

  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    try {
      const testKey = 'health-check-test';
      const testValue = 'test';

      // Test write
      await this.cacheService.set(testKey, testValue, 10);

      // Test read
      const result = await this.cacheService.get(testKey);

      // Test delete
      await this.cacheService.delete(testKey);

      const isHealthy = result === testValue;

      const response = this.getStatus(key, isHealthy, {
        message: isHealthy
          ? 'Cache is working'
          : 'Cache read/write test failed',
      });

      if (isHealthy) {
        return response;
      }

      throw new HealthCheckError('Cache check failed', response);
    } catch (error) {
      throw new HealthCheckError(
        'Cache check failed',
        this.getStatus(key, false, {
          message: error.message,
        }),
      );
    }
  }
}

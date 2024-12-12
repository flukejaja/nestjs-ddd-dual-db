import { Injectable } from '@nestjs/common';
import { MetricsService } from '../services/metrics.service';

@Injectable()
export class PerformanceMonitor {
  constructor(private metricsService: MetricsService) {}

  async trackDatabaseOperation(operation: string, duration: number) {
    this.metricsService.recordMetric('database_operation_duration', duration, {
      operation,
    });
  }

  async trackCacheHitRate(hits: number, misses: number) {
    const hitRate = hits / (hits + misses);
    this.metricsService.recordMetric('cache_hit_rate', hitRate);
  }
}

import { Injectable } from '@nestjs/common';
import { Registry, Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsService {
  private static registry: Registry;
  private static httpRequestDuration: Histogram;
  private static httpRequestTotal: Counter;
  private static errorTotal: Counter;

  constructor() {
    if (!MetricsService.registry) {
      MetricsService.registry = new Registry();

      MetricsService.httpRequestDuration = new Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.1, 0.5, 1, 2, 5],
      });

      MetricsService.httpRequestTotal = new Counter({
        name: 'http_requests_total',
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'route', 'status_code'],
      });

      MetricsService.errorTotal = new Counter({
        name: 'error_total',
        help: 'Total number of errors',
        labelNames: ['type'],
      });

      MetricsService.registry.registerMetric(
        MetricsService.httpRequestDuration,
      );
      MetricsService.registry.registerMetric(MetricsService.httpRequestTotal);
      MetricsService.registry.registerMetric(MetricsService.errorTotal);
    }
  }

  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ) {
    MetricsService.httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration);
    MetricsService.httpRequestTotal
      .labels(method, route, statusCode.toString())
      .inc();
  }

  recordError(type: string) {
    MetricsService.errorTotal.labels(type).inc();
  }

  async getMetrics(): Promise<string> {
    return MetricsService.registry.metrics();
  }
}

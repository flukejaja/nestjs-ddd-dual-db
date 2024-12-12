import { Injectable } from '@nestjs/common';
import { Registry, Counter, Histogram, Metric, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  private static registry: Registry;
  private static httpRequestDuration: Histogram;
  private static httpRequestTotal: Counter;
  private static errorTotal: Counter;
  private static customMetrics: Map<string, Metric>;

  constructor() {
    if (!MetricsService.registry) {
      MetricsService.registry = new Registry();
      MetricsService.customMetrics = new Map();
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
  recordMetric(
    name: string,
    value: number,
    labels: Record<string, string> = {},
    type: 'counter' | 'gauge' | 'histogram' = 'gauge',
    options: {
      help?: string;
      buckets?: number[];
    } = {},
  ) {
    const metricKey = `${name}_${type}`;
    let metric = MetricsService.customMetrics.get(metricKey);

    if (!metric) {
      // Create new metric if it doesn't exist
      switch (type) {
        case 'counter':
          metric = new Counter({
            name,
            help: options.help || `${name} counter metric`,
            labelNames: Object.keys(labels),
          });
          break;
        case 'gauge':
          metric = new Gauge({
            name,
            help: options.help || `${name} gauge metric`,
            labelNames: Object.keys(labels),
          });
          break;
        case 'histogram':
          metric = new Histogram({
            name,
            help: options.help || `${name} histogram metric`,
            labelNames: Object.keys(labels),
            buckets: options.buckets || [0.1, 0.5, 1, 2, 5],
          });
          break;
      }

      MetricsService.customMetrics.set(metricKey, metric);
      MetricsService.registry.registerMetric(metric);
    }

    // Record the metric value
    switch (type) {
      case 'counter':
        (metric as Counter).inc(labels, value);
        break;
      case 'gauge':
        (metric as Gauge).set(labels, value);
        break;
      case 'histogram':
        (metric as Histogram).observe(labels, value);
        break;
    }
  }

  incrementCounter(
    name: string,
    labels: Record<string, string> = {},
    value = 1,
  ) {
    this.recordMetric(name, value, labels, 'counter');
  }

  setGauge(name: string, value: number, labels: Record<string, string> = {}) {
    this.recordMetric(name, value, labels, 'gauge');
  }

  recordHistogram(
    name: string,
    value: number,
    labels: Record<string, string> = {},
    buckets?: number[],
  ) {
    this.recordMetric(name, value, labels, 'histogram', { buckets });
  }

  async getMetrics(): Promise<string> {
    return MetricsService.registry.metrics();
  }
}

import { MetricsService } from '@/infrastructure/services/metrics.service';
import { Controller, Get } from '@nestjs/common';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  async getMetrics() {
    return this.metricsService.getMetrics();
  }
}

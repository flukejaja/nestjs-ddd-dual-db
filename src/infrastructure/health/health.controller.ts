import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { Public } from '../decorators/public.decorator';
import { CacheHealthIndicator } from './cache.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private cacheHealth: CacheHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.cacheHealth.isHealthy('cache')]);
  }
}

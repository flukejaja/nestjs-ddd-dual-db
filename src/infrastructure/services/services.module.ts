import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomLoggerService } from './custom-logger.service';
import { RequestContextService } from './request-context.service';
import { CircuitBreakerService } from './circuit-breaker.service';
import { MetricsService } from './metrics.service';
import {
  CIRCUIT_BREAKER_OPTIONS,
  defaultCircuitBreakerOptions,
} from '../config/circuit-breaker.config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: CIRCUIT_BREAKER_OPTIONS,
      useValue: defaultCircuitBreakerOptions,
    },
    CustomLoggerService,
    RequestContextService,
    CircuitBreakerService,
    MetricsService,
  ],
  exports: [
    CustomLoggerService,
    RequestContextService,
    CircuitBreakerService,
    MetricsService,
    CIRCUIT_BREAKER_OPTIONS,
  ],
})
export class ServicesModule {}

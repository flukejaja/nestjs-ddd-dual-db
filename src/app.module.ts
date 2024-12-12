import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import { DatabaseModule } from './infrastructure/database/database.module';
import { EventBusModule } from './infrastructure/event-bus/event-bus.module';
import {
  repositoryProviders,
  serviceProviders,
  coreProviders,
  USER_SERVICE,
  AUTH_SERVICE,
} from './providers';
import { ThrottlerModule } from '@nestjs/throttler';
import { EnhancedSecurityHeadersMiddleware } from './infrastructure/middleware/security-headers.middleware';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AdvancedRateLimitGuard } from './infrastructure/guards/advanced-rate-limit.guard';
import { EnhancedJwtAuthGuard } from './infrastructure/guards/enhanced-jwt-auth.guard';
import { MetricsInterceptor } from './infrastructure/interceptors/metrics.interceptor';
import { RequestTrackingMiddleware } from './infrastructure/middleware/request-tracking.middleware';
import { CustomLoggerService } from './infrastructure/services/custom-logger.service';
import { MetricsService } from './infrastructure/services/metrics.service';
import { CircuitBreakerService } from './infrastructure/services/circuit-breaker.service';
import { RequestContextService } from './infrastructure/services/request-context.service';
import { ServicesModule } from './infrastructure/services/services.module';
import { HealthModule } from './infrastructure/health/health.module';
import { SessionService } from './infrastructure/services/session.service';
import { SessionGuard } from './infrastructure/guards/session.guard';
import { SessionGateway } from './infrastructure/gateways/session.gateway';
import {
  SESSION_CONFIG,
  defaultSessionConfig,
} from './infrastructure/config/session.config';
import { AuthThrottlerGuard } from './infrastructure/guards/auth-throttler.guard';
import { getThrottlerConfig } from './infrastructure/config/throttler.config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    ServicesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
    CacheModule.register(),
    EventBusModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getThrottlerConfig,
      inject: [ConfigService],
    }),
    HealthModule,
  ],
  providers: [
    ...repositoryProviders,
    ...serviceProviders,
    ...coreProviders,
    {
      provide: APP_GUARD,
      useClass: AdvancedRateLimitGuard,
    },
    {
      provide: APP_GUARD,
      useClass: EnhancedJwtAuthGuard,
    },
    RequestContextService,
    CustomLoggerService,
    MetricsService,
    CircuitBreakerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    SessionService,
    {
      provide: APP_GUARD,
      useClass: SessionGuard,
    },
    SessionGateway,
    {
      provide: SESSION_CONFIG,
      useValue: defaultSessionConfig,
    },
    {
      provide: APP_GUARD,
      useClass: AuthThrottlerGuard,
    },
  ],
  exports: [USER_SERVICE, AUTH_SERVICE],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(EnhancedSecurityHeadersMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer.apply(RequestTrackingMiddleware).forRoutes('*');
  }
}

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
import { SecurityHeadersMiddleware } from './infrastructure/middleware/security-headers.middleware';
import { APP_GUARD } from '@nestjs/core';
import { AdvancedRateLimitGuard } from './infrastructure/guards/advanced-rate-limit.guard';
import { EnhancedJwtAuthGuard } from './infrastructure/guards/enhanced-jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
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
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('THROTTLE_TTL', 60), // Time window (seconds)
          limit: configService.get('THROTTLE_LIMIT', 10), // Max requests per TTL
        },
      ],
      inject: [ConfigService],
    }),
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
  ],
  exports: [USER_SERVICE, AUTH_SERVICE],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityHeadersMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

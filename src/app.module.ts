import { Module } from '@nestjs/common';
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
  ],
  providers: [...repositoryProviders, ...serviceProviders, ...coreProviders],
  exports: [USER_SERVICE, AUTH_SERVICE],
})
export class AppModule {}

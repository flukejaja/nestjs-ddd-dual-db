import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { CacheService } from '../services/cache.service';
import { CacheHealthIndicator } from './cache.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [CacheService, CacheHealthIndicator],
})
export class HealthModule {}

import { ConfigService } from '@nestjs/config';
import { RedisClientOptions } from 'redis';

export const getRedisConfig = (
  configService: ConfigService,
): RedisClientOptions => ({
  socket: {
    host: configService.get('REDIS_HOST', 'localhost'),
    port: configService.get('REDIS_PORT', 6379),
  },
  password: configService.get('REDIS_PASSWORD'),
  database: configService.get('REDIS_DB', 0),
});

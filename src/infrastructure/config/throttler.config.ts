import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

export const getThrottlerConfig = (
  configService: ConfigService,
): ThrottlerModuleOptions => ({
  throttlers: [
    {
      ttl: configService.get('THROTTLE_TTL', 60),
      limit: configService.get('THROTTLE_LIMIT', 5),
    },
  ],
  ignoreUserAgents: [
    // ยกเว้น health checks หรือ monitoring tools
    /health-check/,
    /monitoring/,
  ],
});

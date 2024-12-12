import { ConfigService } from '@nestjs/config';
import { FastifyHelmetOptions } from '@fastify/helmet';

export interface SecurityConfig {
  helmet: FastifyHelmetOptions;
  cors: {
    origin: string[];
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    credentials: boolean;
    maxAge: number;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

export const getSecurityConfig = (
  configService: ConfigService,
): SecurityConfig => ({
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  } as FastifyHelmetOptions,
  cors: {
    origin: configService.get<string[]>('ALLOWED_ORIGINS', []).filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count'],
    credentials: true,
    maxAge: 3600,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: configService.get('RATE_LIMIT_MAX', 100),
  },
});

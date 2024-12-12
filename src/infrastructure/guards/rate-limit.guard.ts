import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { FastifyRequest } from 'fastify';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected async getTracker(req: FastifyRequest): Promise<string> {
    return (req.headers['x-forwarded-for'] as string) || req.ip;
  }
}

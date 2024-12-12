import { ExecutionContext, Injectable } from '@nestjs/common';
import {
  ThrottlerGenerateKeyFunction,
  ThrottlerGuard,
  ThrottlerOptions,
  ThrottlerGetTrackerFunction,
} from '@nestjs/throttler';
import { FastifyRequest } from 'fastify';

@Injectable()
export class AdvancedRateLimitGuard extends ThrottlerGuard {
  protected async getTracker(req: FastifyRequest): Promise<string> {
    // Combine IP and User ID for more precise rate limiting
    const userId = req.user?.sub || 'anonymous';
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip;
    return `${userId}:${ip}`;
  }

  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
    throttler: ThrottlerOptions,
    getTracker: ThrottlerGetTrackerFunction,
    generateKey: ThrottlerGenerateKeyFunction,
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest<FastifyRequest>();
    //const key = await this.getTracker(req);

    if (req.user) {
      limit = limit * 2;
    }

    return super.handleRequest(
      context,
      limit,
      ttl,
      throttler,
      getTracker,
      generateKey,
    );
  }
}

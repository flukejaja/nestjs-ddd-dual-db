import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { FastifyRequest } from 'fastify';

@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: FastifyRequest): Promise<string> {
    const ip = req.headers['x-forwarded-for'] || req.ip;
    const body = req.body as { email?: string };
    const email = body?.email || 'anonymous';
    return `auth:${ip}:${email}`;
  }

  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const shouldSkipFromParent = await super.shouldSkip(context);
    if (shouldSkipFromParent) return true;

    const req = context.switchToHttp().getRequest<FastifyRequest>();

    const isInternalService = req.headers['x-internal-service'] === 'true';
    const isDevEnvironment = process.env.NODE_ENV === 'development';

    return isInternalService || isDevEnvironment;
  }
}

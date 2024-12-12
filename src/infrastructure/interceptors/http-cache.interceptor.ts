import { Injectable, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { CacheInterceptor } from '@nestjs/cache-manager';
@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const { method: httpMethod, url } = request;

    if (!['GET', 'HEAD'].includes(httpMethod)) {
      return undefined;
    }

    return `${httpMethod}:${url}:${JSON.stringify(request.query)}`;
  }
}

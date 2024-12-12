import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FastifyRequest } from 'fastify';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        request.log.info({
          duration,
          route: request.routerPath,
          method: request.method,
        });
      }),
    );
  }
}

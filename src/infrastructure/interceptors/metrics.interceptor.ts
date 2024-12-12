import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../services/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const http = context.switchToHttp();
    const request = http.getRequest();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - start) / 1000; // Convert to seconds
          this.metricsService.recordHttpRequest(
            request.method,
            request.route.path,
            200,
            duration,
          );
        },
        error: (error) => {
          const duration = (Date.now() - start) / 1000;
          this.metricsService.recordHttpRequest(
            request.method,
            request.route.path,
            error.status || 500,
            duration,
          );
          this.metricsService.recordError(error.name || 'UnknownError');
        },
      }),
    );
  }
}

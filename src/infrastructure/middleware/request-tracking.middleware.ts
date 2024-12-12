import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { CustomLoggerService } from '../services/logger.service';

@Injectable()
export class RequestTrackingMiddleware implements NestMiddleware {
  constructor(private logger: CustomLoggerService) {}

  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    const requestId = req.headers['x-request-id'] || uuidv4();
    const correlationId = req.headers['x-correlation-id'] || requestId;

    req.headers['x-request-id'] = requestId;
    req.headers['x-correlation-id'] = correlationId;

    this.logger.log({
      type: 'REQUEST_START',
      method: req.method,
      url: req.url,
      requestId,
      correlationId,
    });

    const start = Date.now();
    res.raw.on('finish', () => {
      const duration = Date.now() - start;
      this.logger.log({
        type: 'REQUEST_END',
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        requestId,
        correlationId,
      });
    });

    next();
  }
}

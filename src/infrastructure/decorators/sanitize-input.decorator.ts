import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { escape } from 'sqlstring';

export const SanitizeInput = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const sanitizedBody = {};

    Object.keys(request.body).forEach((key) => {
      if (typeof request.body[key] === 'string') {
        sanitizedBody[key] = escape(request.body[key]);
      } else {
        sanitizedBody[key] = request.body[key];
      }
    });

    return sanitizedBody;
  },
);

import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiResponseOptions } from '@nestjs/swagger';

export function ApiResponseWrapper(
  options: ApiResponseOptions & { schema?: any },
) {
  return applyDecorators(
    ApiResponse({
      ...options,
      content: {
        'application/json': {
          schema: {
            properties: {
              data: { type: 'object', ...options.schema },
              meta: {
                type: 'object',
                properties: {
                  timestamp: { type: 'string' },
                  path: { type: 'string' },
                },
              },
            },
          },
        },
      },
    }),
  );
}

import { TokenPayload } from '@domain/interfaces/token-payload.interface';

declare module 'fastify' {
  interface FastifyRequest {
    user?: TokenPayload;
  }
}

import { Injectable, LoggerService } from '@nestjs/common';
import { FastifyInstance } from 'fastify';

@Injectable()
export class CustomLogger implements LoggerService {
  constructor(private readonly fastify: FastifyInstance) {}

  log(message: string) {
    this.fastify.log.info(message);
  }

  error(message: string, trace: string) {
    this.fastify.log.error({ msg: message, trace });
  }

  warn(message: string) {
    this.fastify.log.warn(message);
  }

  debug(message: string) {
    this.fastify.log.debug(message);
  }

  verbose(message: string) {
    this.fastify.log.trace(message);
  }
}

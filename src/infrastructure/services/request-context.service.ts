import { Injectable, Scope } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private request: FastifyRequest;

  setRequest(request: FastifyRequest) {
    this.request = request;
  }

  getUser() {
    return this.request.user;
  }

  getRequestId() {
    return this.request.headers['x-request-id'];
  }

  getClientIp() {
    return this.request.ip;
  }
}

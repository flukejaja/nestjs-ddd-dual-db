import { Injectable, Scope } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private static asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

  static getStore() {
    return this.asyncLocalStorage.getStore() || new Map();
  }

  static run(callback: () => void) {
    return this.asyncLocalStorage.run(new Map(), callback);
  }

  getRequestId(): string {
    return RequestContextService.getStore().get('requestId');
  }

  getUser(): any {
    return RequestContextService.getStore().get('user');
  }

  getClientIp(): string {
    return RequestContextService.getStore().get('clientIp');
  }

  set(key: string, value: any): void {
    RequestContextService.getStore().set(key, value);
  }
}

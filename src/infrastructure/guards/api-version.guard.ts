import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import semver from 'semver';

@Injectable()
export class ApiVersionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const version = this.reflector.get<string>('version', context.getHandler());
    if (!version) return true;

    const request = context.switchToHttp().getRequest();
    const clientVersion = request.headers['api-version'];

    return semver.satisfies(clientVersion || '1.0.0', version);
  }
}

import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { CacheService } from '../services/cache.service';

@Injectable()
export class EnhancedJwtAuthGuard {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly cacheManager: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      // Check token expiration
      if (this.isTokenExpired(payload.exp)) {
        throw new UnauthorizedException('Token has expired');
      }

      // Check if token is blacklisted
      if (await this.isTokenBlacklisted(token)) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // Add additional claims validation
      this.validateClaims(payload);

      request.user = payload;
      return true;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: FastifyRequest): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private isTokenExpired(exp: number): boolean {
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  }

  private async isTokenBlacklisted(token: string): Promise<boolean> {
    const cachedToken = await this.cacheManager.get(token);
    return cachedToken !== null;
  }

  private validateClaims(payload: any): void {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token claims');
    }
  }
}

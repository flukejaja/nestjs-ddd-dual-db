import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionService } from '../services/session.service';
import { CustomLoggerService } from '../services/custom-logger.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private sessionService: SessionService,
    private readonly logger: CustomLoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.headers['x-session-id'];

    if (!sessionId) {
      throw new UnauthorizedException('No session ID provided');
    }

    const session = await this.sessionService.getSession(sessionId);

    if (!session) {
      await this.sessionService.handleExpiredSession(request.user?.sub);
      throw new UnauthorizedException('Invalid or expired session');
    }

    request.session = session;
    return true;
  }
}

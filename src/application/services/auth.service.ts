import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserService } from '@domain/services/user.service.interface';
import { HashService } from '@infrastructure/services/hash.service';
import { LoginDto } from '@application/dtos/login.dto';
import { TokenPayload } from '@domain/interfaces/token-payload.interface';
import { USER_SERVICE } from '@/providers';
import { SessionService } from '@infrastructure/services/session.service';
import { CacheService } from '@/infrastructure/services/cache.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => USER_SERVICE))
    private readonly userService: IUserService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly sessionService: SessionService,
    private readonly cacheService: CacheService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await this.hashService.compare(password, user.password))) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: TokenPayload = {
      sub: user.id,
      username: user.email,
    };

    const accessToken = this.jwtService.sign(payload);
    const sessionId = await this.sessionService.createSession(user.id, {
      accessToken,
      userAgent: loginDto.userAgent,
      ipAddress: loginDto.ipAddress,
    });

    return {
      access_token: accessToken,
      session_id: sessionId,
      user,
    };
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionService.deleteSession(sessionId);
  }

  async validateSession(sessionId: string): Promise<boolean> {
    const session = await this.sessionService.getSession(sessionId);
    return !!session;
  }

  async validateLogin(
    email: string,
    password: string,
    ip: string,
  ): Promise<boolean> {
    // Add brute force protection
    const attempts = await this.getLoginAttempts(ip);
    if (attempts >= 5) {
      throw new UnauthorizedException(
        'Too many login attempts. Please try again later.',
      );
    }

    // Implement timing attack protection
    const user = await this.userService.findByEmail(email);
    const isValid = await this.hashService.compare(
      password,
      user?.password || 'dummy-hash',
    );

    if (!isValid) {
      await this.incrementLoginAttempts(ip);
      throw new UnauthorizedException('Invalid credentials');
    }

    return true;
  }

  private async getLoginAttempts(ip: string): Promise<number> {
    return (await this.cacheService.get(`login-attempts:${ip}`)) || 0;
  }

  private async incrementLoginAttempts(ip: string): Promise<void> {
    const attempts = await this.getLoginAttempts(ip);
    await this.cacheService.set(`login-attempts:${ip}`, attempts + 1, 3600);
  }
}

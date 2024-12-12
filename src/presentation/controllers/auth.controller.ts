import {
  Controller,
  Post,
  Body,
  Headers,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoginDto } from '@application/dtos/login.dto';
import { SessionGuard } from '@infrastructure/guards/session.guard';
import { JwtAuthGuard } from '@infrastructure/guards/jwt-auth.guard';
import { Ip } from '@nestjs/common';
import { SessionService } from '@infrastructure/services/session.service';
import { AuthService } from '@/application/services/auth.service';
import { AuthThrottlerGuard } from '@/infrastructure/guards/auth-throttler.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('login')
  @UseGuards(AuthThrottlerGuard)
  @ApiOperation({ summary: 'Login user' })
  async login(
    @Body() loginDto: LoginDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
  ) {
    return this.authService.login({
      ...loginDto,
      userAgent,
      ipAddress,
    });
  }

  @Post('logout')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Headers('x-session-id') sessionId: string) {
    await this.authService.logout(sessionId);
    return { message: 'Logged out successfully' };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user sessions' })
  async getUserSessions(@Request() req) {
    return this.sessionService.getUserSessions(req.user.sub);
  }
}

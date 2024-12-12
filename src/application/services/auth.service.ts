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

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => USER_SERVICE))
    private readonly userService: IUserService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
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

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}

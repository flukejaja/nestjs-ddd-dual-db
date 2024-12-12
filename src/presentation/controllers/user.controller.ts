import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UserService } from '@domain/services/user.service';
import { CreateUserDto } from '@application/dtos/create-user.dto';
import { JwtAuthGuard } from '@infrastructure/guards/jwt-auth.guard';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { TimeoutInterceptor } from '@infrastructure/interceptors/timeout.interceptor';
import { ApiResponseWrapper } from '@/infrastructure/decorators/api-response.decorator';
import { Transaction } from '@/infrastructure/decorators/transaction.decorator';
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Throttle({ default: { ttl: 30, limit: 3 } })
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponseWrapper({
    status: 201,
    description: 'User created successfully',
    schema: CreateUserDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @UseInterceptors(TimeoutInterceptor)
  async createUser(@Transaction() @Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.create(createUserDto);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @SkipThrottle()
  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the user.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }
}

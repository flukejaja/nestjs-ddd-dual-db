import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '@application/dtos/create-user.dto';
import { UpdateUserDto } from '@application/dtos/update-user.dto';
import { HashService } from '../../infrastructure/services/hash.service';
import { IUserService } from './user.service.interface';
import { MONGO_USER_REPOSITORY, USER_REPOSITORY } from '@/providers';
import { IUserRepository } from '../repositories/user.repository.interface';
import { IMongoUserRepository } from '@/infrastructure/repositories/mongo-user.repository.interface';
import { CacheService } from '@infrastructure/services/cache.service';
import { EventBusService } from '@/infrastructure/services/event-bus.service';
import { UserCreatedEvent } from '../events/user-created.event';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(MONGO_USER_REPOSITORY)
    private readonly mongoUserRepository: IMongoUserRepository,
    private readonly hashService: HashService,
    private readonly cacheService: CacheService,
    private readonly eventBus: EventBusService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.hashService.hash(createUserDto.password);
    const user = new User(createUserDto.email, hashedPassword, false);
    const savedUser = await this.userRepository.save(user);

    await this.eventBus.emit('user.created', new UserCreatedEvent(savedUser));

    return savedUser;
  }

  async findById(id: string): Promise<User> {
    const cacheKey = `user:${id}`;

    return this.cacheService.wrap(
      cacheKey,
      async () => {
        const user = await this.userRepository.findById(id);
        if (!user) {
          throw new NotFoundException('User not found');
        }
        return user;
      },
      3600, // cache for 1 hour
    );
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.password) {
      updateUserDto.password = await this.hashService.hash(
        updateUserDto.password,
      );
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.delete(user.id);
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.cacheService.delete(`user:${userId}`);
  }
}

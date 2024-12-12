import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { HashService } from '@infrastructure/services/hash.service';
import { CacheService } from '@infrastructure/services/cache.service';
import { EventBusService } from '@infrastructure/services/event-bus.service';
import { User } from '@domain/entities/user.entity';
import { CreateUserDto } from '@application/dtos/create-user.dto';
import { UpdateUserDto } from '@application/dtos/update-user.dto';
import { USER_REPOSITORY, MONGO_USER_REPOSITORY } from '@/providers';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userRepository: any;
  let mongoUserRepository: any;
  let hashService: any;
  let cacheService: any;
  let eventBus: any;

  const mockUser = new User('test@example.com', 'hashedPassword123', false);
  mockUser.id = '1';

  beforeEach(async () => {
    // Create mock implementations
    userRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mongoUserRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    hashService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      wrap: jest.fn(),
    };

    eventBus = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_REPOSITORY,
          useValue: userRepository,
        },
        {
          provide: MONGO_USER_REPOSITORY,
          useValue: mongoUserRepository,
        },
        {
          provide: HashService,
          useValue: hashService,
        },
        {
          provide: CacheService,
          useValue: cacheService,
        },
        {
          provide: EventBusService,
          useValue: eventBus,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      hashService.hash.mockResolvedValue('hashedPassword123');
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(hashService.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(userRepository.save).toHaveBeenCalled();
      expect(eventBus.emit).toHaveBeenCalledWith(
        'user.created',
        expect.any(Object),
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById', () => {
    it('should return a user from cache if available', async () => {
      cacheService.wrap.mockImplementation(async () => mockUser);

      const result = await service.findById('1');

      expect(cacheService.wrap).toHaveBeenCalledWith(
        'user:1',
        expect.any(Function),
        3600,
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user is not found', async () => {
      cacheService.wrap.mockImplementation(async () => null);
      userRepository.findById.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue({ ...mockUser, ...updateUserDto });

      const result = await service.update('1', updateUserDto);

      expect(userRepository.save).toHaveBeenCalled();
      expect(result.email).toBe(updateUserDto.email);
    });

    it('should hash password if included in update', async () => {
      const updateUserDto: UpdateUserDto = {
        password: 'newPassword123',
      };

      userRepository.findById.mockResolvedValue(mockUser);
      hashService.hash.mockResolvedValue('newHashedPassword123');
      userRepository.save.mockResolvedValue({
        ...mockUser,
        password: 'newHashedPassword123',
      });

      await service.update('1', updateUserDto);

      expect(hashService.hash).toHaveBeenCalledWith(updateUserDto.password);
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue(true);

      await service.delete('1');

      expect(userRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when trying to delete non-existent user', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.delete('999')).rejects.toThrow(NotFoundException);
    });
  });
});

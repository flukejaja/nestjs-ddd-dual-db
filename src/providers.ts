import { Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserRepository } from './domain/repositories/user.repository';
import { UserService } from './domain/services/user.service';
import { AuthService } from './application/services/auth.service';
import { HashService } from './infrastructure/services/hash.service';
import { EmailService } from './infrastructure/services/email.service';
import { CacheService } from './infrastructure/services/cache.service';
import { MongoUserRepository } from './infrastructure/repositories/mongo-user.repository';
import { IUserRepository } from './domain/repositories/user.repository.interface';
import { IMongoUserRepository } from './infrastructure/repositories/mongo-user.repository.interface';
import { EventBusService } from './infrastructure/services/event-bus.service';

export const USER_REPOSITORY = 'USER_REPOSITORY';
export const USER_SERVICE = 'USER_SERVICE';
export const MONGO_USER_REPOSITORY = 'MONGO_USER_REPOSITORY';
export const AUTH_SERVICE = 'AUTH_SERVICE';

export const repositoryProviders: Provider[] = [
  {
    provide: USER_REPOSITORY,
    useFactory: (dataSource: DataSource) => {
      return new UserRepository(dataSource);
    },
    inject: [DataSource],
  },
  {
    provide: MONGO_USER_REPOSITORY,
    useClass: MongoUserRepository,
  },
];

export const serviceProviders: Provider[] = [
  HashService,
  EmailService,
  CacheService,
];

export const coreProviders: Provider[] = [
  {
    provide: USER_SERVICE,
    useFactory: (
      userRepo: IUserRepository,
      mongoRepo: IMongoUserRepository,
      hashService: HashService,
      cacheService: CacheService,
      eventBus: EventBusService,
    ) => {
      return new UserService(
        userRepo,
        mongoRepo,
        hashService,
        cacheService,
        eventBus,
      );
    },
    inject: [
      USER_REPOSITORY,
      MONGO_USER_REPOSITORY,
      HashService,
      CacheService,
      EventBusService,
    ],
  },
  {
    provide: AUTH_SERVICE,
    useClass: AuthService,
  },
];

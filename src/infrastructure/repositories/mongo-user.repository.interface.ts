import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { User } from '@domain/entities/user.entity';
import { UserMongo } from '@domain/schemas/user.schema';

export interface IMongoUserRepository extends IUserRepository {
  toEntity(mongoUser: UserMongo): User;
}

import { User } from '../entities/user.entity';

export interface IUserRepository {
  save(user: User): Promise<User>;
  findByEmail(email: string): Promise<User>;
  findById(id: string): Promise<User>;
  delete(id: string): Promise<boolean>;
  update(id: string, user: Partial<User>): Promise<User>;
}

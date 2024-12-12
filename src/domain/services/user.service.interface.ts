import { User } from '../entities/user.entity';
import { CreateUserDto } from '@application/dtos/create-user.dto';
import { UpdateUserDto } from '@application/dtos/update-user.dto';

export interface IUserService {
  create(createUserDto: CreateUserDto): Promise<User>;
  update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
  findByEmail(email: string): Promise<User>;
  findById(id: string): Promise<User>;
  delete(id: string): Promise<void>;
}

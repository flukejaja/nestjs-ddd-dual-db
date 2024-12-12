import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { IUserRepository } from './user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  private repository: Repository<User>;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(User);
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email) {
      return null;
    }
    return this.repository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    if (!id) {
      return null;
    }
    return this.repository.findOne({ where: { id } });
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    const existingUser = await this.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    await this.repository.update(id, user);
    const updatedUser = await this.findById(id);
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    const existingUser = await this.findById(id);
    if (!existingUser) {
      return false;
    }

    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async findByEmailOrThrow(email: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email "${email}" not found`);
    }
    return user;
  }
}

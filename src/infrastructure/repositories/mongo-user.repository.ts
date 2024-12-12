import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@domain/entities/user.entity';
import { UserMongo } from '@domain/schemas/user.schema';
import { IMongoUserRepository } from './mongo-user.repository.interface';

@Injectable()
export class MongoUserRepository implements IMongoUserRepository {
  constructor(
    @InjectModel(UserMongo.name)
    private userModel: Model<UserMongo>,
  ) {}

  async save(user: User): Promise<User> {
    const createdUser = new this.userModel({
      email: user.email,
      password: user.password,
      isVerified: user.isVerified,
    });
    const savedUser = await createdUser.save();
    return this.toEntity(savedUser);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? this.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return user ? this.toEntity(user) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, user, { new: true })
      .exec();
    return this.toEntity(updatedUser);
  }

  toEntity(mongoUser: UserMongo): User {
    const user = new User(
      mongoUser.email,
      mongoUser.password,
      mongoUser.isVerified,
    );
    user.id = mongoUser.id.toString();
    return user;
  }
}

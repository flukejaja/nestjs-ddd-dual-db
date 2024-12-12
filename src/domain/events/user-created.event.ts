import { BaseEvent } from './base.event';
import { User } from '../entities/user.entity';

export class UserCreatedEvent extends BaseEvent {
  constructor(user: User) {
    super('user.created', {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    });
  }
}

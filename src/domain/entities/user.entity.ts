import { BaseEntity } from './base.entity';

export class User extends BaseEntity {
  email: string;
  password: string;
  isVerified: boolean;
  constructor(email: string, password: string, isVerified: boolean) {
    super();
    this.email = email;
    this.password = password;
    this.isVerified = isVerified;
  }
}

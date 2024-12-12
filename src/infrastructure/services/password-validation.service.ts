import { Injectable } from '@nestjs/common';
import { ValidationError } from '../exceptions/custom.error';

@Injectable()
export class PasswordValidationService {
  private readonly MIN_LENGTH = 8;
  private readonly REQUIRED_PATTERNS = [
    { pattern: /[A-Z]/, message: 'uppercase letter' },
    { pattern: /[a-z]/, message: 'lowercase letter' },
    { pattern: /[0-9]/, message: 'number' },
    { pattern: /[!@#$%^&*]/, message: 'special character' },
  ];

  validatePassword(password: string): void {
    const errors: string[] = [];

    if (password.length < this.MIN_LENGTH) {
      errors.push(
        `Password must be at least ${this.MIN_LENGTH} characters long`,
      );
    }

    this.REQUIRED_PATTERNS.forEach(({ pattern, message }) => {
      if (!pattern.test(password)) {
        errors.push(`Password must contain at least one ${message}`);
      }
    });

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }
  }

  async validatePasswordHistory(
    newPassword: string,
    oldPasswords: string[],
  ): Promise<void> {
    if (oldPasswords.includes(newPassword)) {
      throw new ValidationError(
        'Password has been used before. Please choose a different password.',
      );
    }
  }
}

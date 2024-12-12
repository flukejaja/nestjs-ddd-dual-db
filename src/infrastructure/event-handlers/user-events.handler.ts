import { Injectable } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { EmailService } from '../services/email.service';

@Injectable()
export class UserEventsHandler {
  constructor(private readonly emailService: EmailService) {}

  @EventPattern('user.created')
  async handleUserCreated(data: any) {
    await this.emailService.sendWelcomeEmail(data.email, data.email);
  }
}

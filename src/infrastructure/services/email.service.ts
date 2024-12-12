import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('email.host'),
      port: this.configService.get('email.port'),
      secure: true,
      auth: {
        user: this.configService.get('email.user'),
        pass: this.configService.get('email.password'),
      },
    });
  }

  async sendEmail(to: string, subject: string, content: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get('email.from'),
      to,
      subject,
      html: content,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const subject = 'Welcome to our platform!';
    const content = `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for joining our platform.</p>
    `;

    await this.sendEmail(email, subject, content);
  }
}

import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomLoggerService implements LoggerService {
  constructor(private configService: ConfigService) {}

  private formatMessage(message: any, context?: string) {
    return {
      timestamp: new Date().toISOString(),
      context: context || 'Application',
      environment: this.configService.get('NODE_ENV'),
      message,
    };
  }

  log(message: any, context?: string) {
    console.log(JSON.stringify(this.formatMessage(message, context)));
  }

  error(message: any, trace?: string, context?: string) {
    console.error(
      JSON.stringify({
        ...this.formatMessage(message, context),
        trace,
      }),
    );
  }

  warn(message: any, context?: string) {
    console.warn(JSON.stringify(this.formatMessage(message, context)));
  }
}

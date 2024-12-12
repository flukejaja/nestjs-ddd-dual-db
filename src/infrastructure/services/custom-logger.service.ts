import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestContextService } from './request-context.service';

type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose';

interface LogMetadata {
  context?: string;
  requestId?: string;
  userId?: string;
  correlationId?: string;
  additionalData?: Record<string, any>;
}

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLoggerService implements LoggerService {
  private readonly isProduction: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly requestContext: RequestContextService,
  ) {
    this.isProduction = configService.get('NODE_ENV') === 'production';
  }

  private formatMessage(
    level: LogLevel,
    message: any,
    metadata: LogMetadata = {},
  ) {
    const timestamp = new Date().toISOString();
    const requestId = this.requestContext.getRequestId();
    const userId = this.requestContext.getUser()?.sub;
    const clientIp = this.requestContext.getClientIp();

    return {
      timestamp,
      level,
      message: this.normalizeMessage(message),
      requestId,
      userId,
      clientIp,
      environment: this.configService.get('NODE_ENV'),
      ...metadata,
    };
  }

  private normalizeMessage(message: any): string {
    if (typeof message === 'string') return message;
    if (message instanceof Error) {
      return JSON.stringify({
        name: message.name,
        message: message.message,
        stack: this.isProduction ? undefined : message.stack,
      });
    }
    return JSON.stringify(message);
  }

  private writeLog(level: LogLevel, message: any, metadata: LogMetadata = {}) {
    const formattedLog = this.formatMessage(level, message, metadata);

    // In production, write to stdout as JSON
    if (this.isProduction) {
      console[level](JSON.stringify(formattedLog));
      return;
    }

    // In development, pretty print
    const prettyLog = `[${formattedLog.timestamp}] ${level.toUpperCase()} [${
      metadata.context || 'Application'
    }] ${formattedLog.message}`;
    console[level](prettyLog);

    // Log additional metadata in development
    if (Object.keys(metadata).length > 0) {
      console[level]('Metadata:', metadata);
    }
  }

  log(message: any, context?: string, additionalData?: Record<string, any>) {
    this.writeLog('log', message, { context, additionalData });
  }

  error(
    message: any,
    trace?: string,
    context?: string,
    additionalData?: Record<string, any>,
  ) {
    this.writeLog('error', message, {
      context,
      additionalData: { ...additionalData, trace },
    });
  }

  warn(message: any, context?: string, additionalData?: Record<string, any>) {
    this.writeLog('warn', message, { context, additionalData });
  }

  debug(message: any, context?: string, additionalData?: Record<string, any>) {
    if (!this.isProduction) {
      this.writeLog('debug', message, { context, additionalData });
    }
  }

  verbose(
    message: any,
    context?: string,
    additionalData?: Record<string, any>,
  ) {
    if (!this.isProduction) {
      this.writeLog('verbose', message, { context, additionalData });
    }
  }

  // Utility methods for common logging patterns
  logRequest(
    method: string,
    url: string,
    duration: number,
    statusCode: number,
  ) {
    this.log(`${method} ${url} ${statusCode} ${duration}ms`, 'HTTP', {
      duration,
      statusCode,
    });
  }

  logError(error: Error, context?: string) {
    this.error(error.message, error.stack, context, { errorName: error.name });
  }

  logDatabaseQuery(query: string, duration: number) {
    this.debug(`Query executed in ${duration}ms`, 'Database', {
      query,
      duration,
    });
  }
}

import { Injectable, Optional, Inject } from '@nestjs/common';
import { CustomLoggerService } from './custom-logger.service';
import {
  CircuitBreakerOptions,
  CIRCUIT_BREAKER_OPTIONS,
} from '../config/circuit-breaker.config';

enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN,
}

@Injectable()
export class CircuitBreakerService {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime: number = null;

  constructor(
    @Inject(CIRCUIT_BREAKER_OPTIONS)
    private readonly options: CircuitBreakerOptions,
    @Optional() private readonly logger?: CustomLoggerService,
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldReset()) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private shouldReset(): boolean {
    if (!this.lastFailureTime) return false;
    return Date.now() - this.lastFailureTime >= this.options.resetTimeout;
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.logger?.warn(
        `Circuit breaker opened after ${this.failureCount} failures`,
      );
    }
  }
}

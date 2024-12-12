import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CircuitBreakerService } from './circuit-breaker.service';
import { CustomLoggerService } from './custom-logger.service';

@Injectable()
export class ExternalApiService {
  constructor(
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly logger: CustomLoggerService,
  ) {}

  async fetchExternalData() {
    return this.circuitBreaker.execute(async () => {
      try {
        const response = await axios.get('https://api.external.com/data');
        return response.data;
      } catch (error) {
        this.logger.error('External API call failed', error.stack);
        throw error;
      }
    });
  }
}

import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    @InjectDataSource() private readonly postgresConnection: DataSource,
  ) {
    super();
  }

  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    try {
      // Check MongoDB connection
      const mongoStatus = this.mongoConnection.readyState === 1;

      // Check Postgres connection
      const postgresStatus = this.postgresConnection.isInitialized;

      const isHealthy = mongoStatus && postgresStatus;

      const result = this.getStatus(key, isHealthy, {
        mongodb: mongoStatus ? 'up' : 'down',
        postgres: postgresStatus ? 'up' : 'down',
      });

      if (isHealthy) {
        return result;
      }

      throw new HealthCheckError('Database check failed', result);
    } catch (error) {
      throw new HealthCheckError(
        'Database check failed',
        this.getStatus(key, false, {
          message: error.message,
        }),
      );
    }
  }
}

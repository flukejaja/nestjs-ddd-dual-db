import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { EventBusService } from '../services/event-bus.service';
import { getRabbitMQConfig } from '../config/rabbitmq.config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'MAIN_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) =>
          getRabbitMQConfig(configService),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [EventBusService],
  exports: [EventBusService],
})
export class EventBusModule {}

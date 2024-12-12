import { ConfigService } from '@nestjs/config';
import { Transport, RmqOptions } from '@nestjs/microservices';

export const getRabbitMQConfig = (
  configService: ConfigService,
): RmqOptions => ({
  transport: Transport.RMQ,
  options: {
    urls: [configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
    queue: configService.get<string>('RABBITMQ_QUEUE', 'main_queue'),
    queueOptions: {
      durable: true,
    },
  },
});

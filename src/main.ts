import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { setupSwagger } from './infrastructure/config/swagger.config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyHelmet from '@fastify/helmet';
import fastifyCompress from '@fastify/compress';
import { TransformInterceptor } from './infrastructure/interceptors/transform.interceptor';
import { CustomValidationPipe } from './infrastructure/pipes/validation.pipe';
import { GlobalExceptionFilter } from './infrastructure/filters/global-exception.filter';
import { CustomLoggerService } from './infrastructure/services/custom-logger.service';
import { getSecurityConfig } from './infrastructure/config/security.config';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await app.register(
    fastifyHelmet,
    getSecurityConfig(app.get(ConfigService)).helmet,
  );

  await app.register(fastifyCompress);

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  app.useGlobalPipes(new CustomValidationPipe());

  app.useGlobalInterceptors(new TransformInterceptor());

  setupSwagger(app);

  // Add global exception filter
  const logger = app.get(CustomLoggerService);
  app.useGlobalFilters(new GlobalExceptionFilter(logger));
  app.enableCors(getSecurityConfig(app.get(ConfigService)).cors);

  await app.listen(3000, '0.0.0.0');

  // Log health check endpoint
  console.log(`Health check available at: ${await app.getUrl()}/health`);
  console.log(`Metrics available at: ${await app.getUrl()}/metrics`);
  console.log(`Swagger available at: ${await app.getUrl()}/api`);
}
bootstrap();

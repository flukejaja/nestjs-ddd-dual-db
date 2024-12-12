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

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  });

  await app.register(fastifyCompress);

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  app.useGlobalPipes(new CustomValidationPipe());

  app.useGlobalInterceptors(new TransformInterceptor());

  setupSwagger(app);

  await app.listen(3000, '0.0.0.0');
}
bootstrap();

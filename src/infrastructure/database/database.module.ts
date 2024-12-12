import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserMongo, UserSchema } from '@domain/schemas/user.schema';
import { User } from '@domain/entities/user.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres', // or your database type
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User],
        synchronize: true, // set to false in production
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: UserMongo.name, schema: UserSchema }]),
    TypeOrmModule.forFeature([User]),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ttl: Math.max(1, Math.floor(configService.get('REDIS_TTL', 3600))),
        store: 'memory',
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule, TypeOrmModule],
})
export class DatabaseModule {}

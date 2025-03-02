import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { RedisCacheService } from '../cache/redis-cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RedisCacheModule],
  controllers: [UsersController],
  providers: [UsersService, RedisCacheService],
  exports: [UsersService],
})
export class UsersModule {}

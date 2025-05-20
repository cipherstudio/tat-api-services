import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RedisCacheService } from '../cache/redis-cache.service';
import { UserRepository } from './repositories/user.repository';

@Module({
  controllers: [UsersController],
  providers: [UsersService, RedisCacheService, UserRepository],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}

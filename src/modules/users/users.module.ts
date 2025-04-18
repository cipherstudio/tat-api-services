import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RedisCacheService } from '../cache/redis-cache.service';
import { UserRepository } from './repositories/user.repository';
import { UsersRepository } from './repositories/users.repository';

@Module({
  controllers: [UsersController],
  providers: [UsersService, RedisCacheService, UserRepository, UsersRepository],
  exports: [UsersService, UserRepository, UsersRepository],
})
export class UsersModule {}

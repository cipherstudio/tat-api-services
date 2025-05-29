import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RedisCacheService } from '../cache/redis-cache.service';
import { UserRepository } from './repositories/user.repository';
import { EmployeeRepository } from '../dataviews/repositories/employee.repository';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    RedisCacheService,
    UserRepository,
    EmployeeRepository,
  ],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}

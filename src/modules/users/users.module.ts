import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { RedisCacheService } from '../cache/redis-cache.service';
import { UserRepository } from './repositories/user.repository';
import { DatabaseModule } from '../../database/database.module';
import { UsersRepository } from './repositories/users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RedisCacheModule, DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService, RedisCacheService, UserRepository, UsersRepository],
  exports: [UsersService, UserRepository, UsersRepository],
})
export class UsersModule {}

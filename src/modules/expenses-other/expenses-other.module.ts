import { Module } from '@nestjs/common';
import { ExpensesOtherService } from './expenses-other.service.js';
import { ExpensesOtherController } from './expenses-other.controller.js';
import { ExpensesOtherRepository } from './repositories/expenses-other.repository.js';
import { RedisCacheModule } from '../cache/redis-cache.module.js';
import { RedisCacheService } from '../cache/redis-cache.service.js';

@Module({
  imports: [
    RedisCacheModule,
  ],
  controllers: [ExpensesOtherController],
  providers: [ExpensesOtherService, ExpensesOtherRepository, RedisCacheService],
  exports: [ExpensesOtherService],
})
export class ExpensesOtherModule {} 
import { Module } from '@nestjs/common';
import { OfficeInternationalService } from './office-international.service.js';
import { OfficeInternationalController } from './office-international.controller.js';
import { OfficeInternationalRepository } from './repositories/office-international.repository.js';
import { RedisCacheModule } from '../cache/redis-cache.module.js';
import { RedisCacheService } from '../cache/redis-cache.service.js';

@Module({
  imports: [
    RedisCacheModule,
  ],
  controllers: [OfficeInternationalController],
  providers: [OfficeInternationalService, OfficeInternationalRepository, RedisCacheService],
  exports: [OfficeInternationalService],
})
export class OfficeInternationalModule {}

import { Module } from '@nestjs/common';
import { OfficeDomesticService } from './office-domestic.service';
import { OfficeDomesticController } from './office-domestic.controller';
import { OfficeDomesticRepository } from './repositories/office-domestic.repository';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { RedisCacheService } from '../cache/redis-cache.service';

@Module({
  imports: [
    RedisCacheModule,
  ],
  controllers: [OfficeDomesticController],
  providers: [OfficeDomesticService, OfficeDomesticRepository, RedisCacheService],
  exports: [OfficeDomesticService],
})
export class OfficeDomesticModule {} 
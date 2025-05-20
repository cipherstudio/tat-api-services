import { Module } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountriesController } from './countries.controller';
import { CountriesRepository } from './repositories/countries.repository';
import { RedisCacheModule } from '../cache/redis-cache.module';

@Module({
  imports: [
    RedisCacheModule,
  ],
  controllers: [CountriesController],
  providers: [CountriesService, CountriesRepository],
  exports: [CountriesService],
})
export class CountriesModule {}

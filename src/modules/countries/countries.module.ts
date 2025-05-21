import { Module } from '@nestjs/common';
    import { CountriesService } from './countries.service';
    import { CountriesController } from './countries.controller';
    import { CountriesRepository } from './repositories/countries.repository';
    import { RedisCacheModule } from '../cache/redis-cache.module';
    import { RedisCacheService } from '../cache/redis-cache.service';

    @Module({
      imports: [
        RedisCacheModule,
      ],
      controllers: [CountriesController],
      providers: [CountriesService, CountriesRepository, RedisCacheService],
      exports: [CountriesService],
    })
    export class CountriesModule {}

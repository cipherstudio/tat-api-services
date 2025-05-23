import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { PlacesRepository } from './repositories/places.repository';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { RedisCacheService } from '../cache/redis-cache.service';

@Module({
  imports: [
    RedisCacheModule,
  ],
  controllers: [PlacesController],
  providers: [PlacesService, PlacesRepository, RedisCacheService],
  exports: [PlacesService],
})
export class PlacesModule {} 
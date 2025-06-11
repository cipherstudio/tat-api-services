import { Injectable } from '@nestjs/common';
import { AccommodationRatesRepository } from '../repositories/accommodation-rates.repository';
import { RedisCacheService } from '../../cache/redis-cache.service';
import { CreateAccommodationRatesDto } from '../dto/create-accommodation-rates.dto';
import { UpdateAccommodationRatesDto } from '../dto/update-accommodation-rates.dto';
import { AccommodationRatesQueryDto } from '../dto/accommodation-rates-query.dto';
import { AccommodationRates } from '../entities/accommodation-rates.entity';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';

@Injectable()
export class AccommodationRatesService {
  private readonly CACHE_PREFIX = 'accommodation_rates';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    private readonly accommodationRatesRepository: AccommodationRatesRepository,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async findAll(query: AccommodationRatesQueryDto): Promise<PaginatedResult<AccommodationRates>> {
    const cacheKey = this.redisCacheService.generateListKey(this.CACHE_PREFIX, JSON.stringify(query));
    const cachedResult = await this.redisCacheService.get<PaginatedResult<AccommodationRates>>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const result = await this.accommodationRatesRepository.findWithPaginationAndSearch(
      query.page,
      query.limit,
      {
        positionName: query.positionName,
        levelCodeStart: query.levelCodeStart,
        levelCodeEnd: query.levelCodeEnd,
        positionGroupName: query.positionGroupName,
        rateMode: query.rateMode,
        travelType: query.travelType,
      },
      query.orderBy,
      query.orderDir?.toLowerCase() as 'asc' | 'desc',
      query.searchTerm,
    );

    await this.redisCacheService.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  async findById(id: number): Promise<AccommodationRates> {
    const cacheKey = this.redisCacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedResult = await this.redisCacheService.get<AccommodationRates>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const result = await this.accommodationRatesRepository.findById(id);
    if (result) {
      await this.redisCacheService.set(cacheKey, result, this.CACHE_TTL);
    }
    return result;
  }

  async create(createAccommodationRatesDto: CreateAccommodationRatesDto): Promise<AccommodationRates> {
    const result = await this.accommodationRatesRepository.create(createAccommodationRatesDto);
    await this.invalidateListCache();
    return result;
  }

  async update(id: number, updateAccommodationRatesDto: UpdateAccommodationRatesDto): Promise<AccommodationRates> {
    const existing = await this.accommodationRatesRepository.findById(id);
    if (!existing) {
      throw new Error('Accommodation rate not found');
    }

    const result = await this.accommodationRatesRepository.update(id, updateAccommodationRatesDto);
    await this.invalidateCache(id);
    await this.invalidateListCache();
    return result;
  }

  async remove(id: number): Promise<void> {
    const existing = await this.accommodationRatesRepository.findById(id);
    if (!existing) {
      throw new Error('Accommodation rate not found');
    }

    await this.accommodationRatesRepository.delete(id);
    await this.invalidateCache(id);
    await this.invalidateListCache();
  }

  private async invalidateCache(id: number): Promise<void> {
    const cacheKey = this.redisCacheService.generateKey(this.CACHE_PREFIX, id);
    await this.redisCacheService.del(cacheKey);
  }

  private async invalidateListCache(): Promise<void> {
    const cacheKey = this.redisCacheService.generateListKey(this.CACHE_PREFIX);
    await this.redisCacheService.del(cacheKey);
  }
} 
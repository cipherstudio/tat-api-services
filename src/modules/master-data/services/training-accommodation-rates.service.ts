import { Injectable } from '@nestjs/common';
import { TrainingAccommodationRatesRepository } from '../repositories/training-accommodation-rates.repository';
import { RedisCacheService } from '../../cache/redis-cache.service';
import { CreateTrainingAccommodationRatesDto } from '../dto/create-training-accommodation-rates.dto';
import { UpdateTrainingAccommodationRatesDto } from '../dto/update-training-accommodation-rates.dto';
import { TrainingAccommodationRatesQueryDto } from '../dto/training-accommodation-rates-query.dto';
import { TrainingAccommodationRates } from '../entities/training-accommodation-rates.entity';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';

@Injectable()
export class TrainingAccommodationRatesService {
  private readonly CACHE_PREFIX = 'training_accommodation_rates';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    private readonly trainingAccommodationRatesRepository: TrainingAccommodationRatesRepository,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async findAll(query: TrainingAccommodationRatesQueryDto): Promise<PaginatedResult<TrainingAccommodationRates>> {
    const cacheKey = this.redisCacheService.generateListKey(this.CACHE_PREFIX, JSON.stringify(query));
    const cachedResult = await this.redisCacheService.get<PaginatedResult<TrainingAccommodationRates>>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const result = await this.trainingAccommodationRatesRepository.findWithPaginationAndSearch(
      query.page,
      query.limit,
      {
        travelType: query.travelType,
        trainingType: query.trainingType,
      },
      query.orderBy,
      query.orderDir?.toLowerCase() as 'asc' | 'desc',
      query.searchTerm,
    );

    await this.redisCacheService.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  async findById(id: number): Promise<TrainingAccommodationRates> {
    const cacheKey = this.redisCacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedResult = await this.redisCacheService.get<TrainingAccommodationRates>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const result = await this.trainingAccommodationRatesRepository.findById(id);
    if (result) {
      await this.redisCacheService.set(cacheKey, result, this.CACHE_TTL);
    }
    return result;
  }

  async create(
    createTrainingAccommodationRatesDto: CreateTrainingAccommodationRatesDto,
  ): Promise<TrainingAccommodationRates> {
    const result = await this.trainingAccommodationRatesRepository.create(createTrainingAccommodationRatesDto);
    await this.invalidateListCache();
    return result;
  }

  async update(
    id: number,
    updateTrainingAccommodationRatesDto: UpdateTrainingAccommodationRatesDto,
  ): Promise<TrainingAccommodationRates> {
    const existing = await this.trainingAccommodationRatesRepository.findById(id);
    if (!existing) {
      throw new Error('Training accommodation rate not found');
    }

    const result = await this.trainingAccommodationRatesRepository.update(id, updateTrainingAccommodationRatesDto);
    await this.invalidateCache(id);
    await this.invalidateListCache();
    return result;
  }

  async remove(id: number): Promise<void> {
    const existing = await this.trainingAccommodationRatesRepository.findById(id);
    if (!existing) {
      throw new Error('Training accommodation rate not found');
    }

    await this.trainingAccommodationRatesRepository.delete(id);
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

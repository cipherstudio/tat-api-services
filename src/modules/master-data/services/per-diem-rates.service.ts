import { Injectable, NotFoundException } from '@nestjs/common';
import { PerDiemRatesRepository } from '../repositories/per-diem-rates.repository';
import { PerDiemRates } from '../entities/per-diem-rates.entity';
import { CreatePerDiemRatesDto } from '../dto/create-per-diem-rates.dto';
import { UpdatePerDiemRatesDto } from '../dto/update-per-diem-rates.dto';
import { RedisCacheService } from '../../cache/redis-cache.service';
import { PaginatedResult } from '@common/interfaces/pagination.interface';

@Injectable()
export class PerDiemRatesService {
  private readonly CACHE_PREFIX = 'per_diem_rates';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly perDiemRatesRepository: PerDiemRatesRepository,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async findAll(queryOptions?: any): Promise<PaginatedResult<PerDiemRates>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      orderDir = 'DESC',
      positionTitle,
      levelCode,
      areaType,
      searchTerm,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      levelCodeStart,
      levelCodeEnd,
    } = queryOptions || {};

    // Generate cache key that includes all query parameters
    const cacheParams = [
      `page:${page}`,
      `limit:${limit}`,
      `orderBy:${orderBy}`,
      `orderDir:${orderDir}`,
      positionTitle ? `positionTitle:${positionTitle}` : null,
      levelCode ? `levelCode:${levelCode}` : null,
      areaType ? `areaType:${areaType}` : null,
      searchTerm ? `search:${searchTerm}` : null,
      createdAfter ? `createdAfter:${createdAfter.toISOString()}` : null,
      createdBefore ? `createdBefore:${createdBefore.toISOString()}` : null,
      updatedAfter ? `updatedAfter:${updatedAfter.toISOString()}` : null,
      updatedBefore ? `updatedBefore:${updatedBefore.toISOString()}` : null,
      levelCodeStart ? `levelCodeStart:${levelCodeStart}` : null,
      levelCodeEnd ? `levelCodeEnd:${levelCodeEnd}` : null,
    ]
      .filter(Boolean)
      .join(':');

    const cacheKey = this.redisCacheService.generateListKey(
      this.CACHE_PREFIX,
      cacheParams,
    );
    const cachedResult =
      await this.redisCacheService.get<PaginatedResult<PerDiemRates>>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Prepare conditions
    const conditions: Record<string, any> = {};

    if (positionTitle) {
      conditions.position_title = positionTitle;
    }

    if (levelCode) {
      conditions.level_code = levelCode;
    }

    if (areaType) {
      conditions.area_type = areaType;
    }

    if (createdAfter) {
      conditions.created_at = { ...conditions.created_at, $gte: createdAfter };
    }

    if (createdBefore) {
      conditions.created_at = { ...conditions.created_at, $lte: createdBefore };
    }

    if (updatedAfter) {
      conditions.updated_at = { ...conditions.updated_at, $gte: updatedAfter };
    }

    if (updatedBefore) {
      conditions.updated_at = { ...conditions.updated_at, $lte: updatedBefore };
    }

    if (levelCodeStart) {
      conditions.level_code_start = {
        ...conditions.level_code_start,
        $eq: levelCodeStart,
      };
    }

    if (levelCodeEnd) {
      conditions.level_code_end = {
        ...conditions.level_code_end,
        $eq: levelCodeEnd,
      };
    }
    const result =
      await this.perDiemRatesRepository.findWithPaginationAndSearch(
        page,
        limit,
        conditions,
        orderBy,
        orderDir.toLowerCase() as 'asc' | 'desc',
        searchTerm,
      );

    // Cache the result
    await this.redisCacheService.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  async findById(id: number): Promise<PerDiemRates> {
    // Try to get from cache first
    const cacheKey = this.redisCacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedRate = await this.redisCacheService.get<PerDiemRates>(cacheKey);
    if (cachedRate) {
      return cachedRate;
    }

    const rate = await this.perDiemRatesRepository.findById(id);
    if (!rate) {
      throw new NotFoundException(`Per diem rate with ID ${id} not found`);
    }

    // Cache the result
    await this.redisCacheService.set(cacheKey, rate, this.CACHE_TTL);

    return rate;
  }

  async create(
    createPerDiemRatesDto: CreatePerDiemRatesDto,
  ): Promise<PerDiemRates> {
    const savedRate = await this.perDiemRatesRepository.create(
      createPerDiemRatesDto,
    );

    // Cache the new rate
    await this.redisCacheService.set(
      this.redisCacheService.generateKey(this.CACHE_PREFIX, savedRate.id),
      savedRate,
      this.CACHE_TTL,
    );

    // Invalidate the list cache
    await this.redisCacheService.del(
      this.redisCacheService.generateListKey(this.CACHE_PREFIX),
    );

    return savedRate;
  }

  async update(
    id: number,
    updatePerDiemRatesDto: UpdatePerDiemRatesDto,
  ): Promise<PerDiemRates> {
    const rate = await this.findById(id);
    if (!rate) {
      throw new NotFoundException(`Per diem rate with ID ${id} not found`);
    }

    await this.perDiemRatesRepository.update(id, updatePerDiemRatesDto);
    const updatedRate = await this.findById(id);

    // Update cache
    const cacheKey = this.redisCacheService.generateKey(this.CACHE_PREFIX, id);
    await this.redisCacheService.set(cacheKey, updatedRate, this.CACHE_TTL);

    // Invalidate the list cache
    await this.redisCacheService.del(
      this.redisCacheService.generateListKey(this.CACHE_PREFIX),
    );

    return updatedRate;
  }

  async remove(id: number): Promise<void> {
    const result = await this.perDiemRatesRepository.delete(id);
    if (!result) {
      throw new NotFoundException(`Per diem rate with ID ${id} not found`);
    }

    // Remove from cache
    await this.redisCacheService.del(
      this.redisCacheService.generateKey(this.CACHE_PREFIX, id),
    );
    // Invalidate the list cache
    await this.redisCacheService.del(
      this.redisCacheService.generateListKey(this.CACHE_PREFIX),
    );
  }

  async findByLevelCode(levelCode?: string): Promise<PerDiemRates[]> {
    const result = await this.perDiemRatesRepository.findByLevelCode(levelCode);
    return result;
  }
}

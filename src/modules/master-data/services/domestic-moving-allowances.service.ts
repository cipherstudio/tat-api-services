import { Injectable } from '@nestjs/common';
import { DomesticMovingAllowancesRepository } from '../repositories/domestic-moving-allowances.repository';
import { RedisCacheService } from '../../cache/redis-cache.service';
import { CreateDomesticMovingAllowancesDto } from '../dto/create-domestic-moving-allowances.dto';
import { UpdateDomesticMovingAllowancesDto } from '../dto/update-domestic-moving-allowances.dto';
import { DomesticMovingAllowancesQueryDto } from '../dto/domestic-moving-allowances-query.dto';
import { DomesticMovingAllowances } from '../entities/domestic-moving-allowances.entity';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';

@Injectable()
export class DomesticMovingAllowancesService {
  private readonly CACHE_PREFIX = 'domestic_moving_allowances';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    private readonly domesticMovingAllowancesRepository: DomesticMovingAllowancesRepository,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async findAll(query: any): Promise<PaginatedResult<DomesticMovingAllowances>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      orderDir = 'DESC',
      distanceStartKm,
      distanceEndKm,
      rateBaht,
      searchTerm,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    } = query || {};

    // Generate cache key that includes all query parameters
    const cacheParams = [
      `page:${page}`,
      `limit:${limit}`,
      `orderBy:${orderBy}`,
      `orderDir:${orderDir}`,
      distanceStartKm ? `distanceStartKm:${distanceStartKm}` : null,
      distanceEndKm ? `distanceEndKm:${distanceEndKm}` : null,
      rateBaht ? `rateBaht:${rateBaht}` : null,
      searchTerm ? `search:${searchTerm}` : null,
      createdAfter ? `createdAfter:${createdAfter.toISOString()}` : null,
      createdBefore ? `createdBefore:${createdBefore.toISOString()}` : null,
      updatedAfter ? `updatedAfter:${updatedAfter.toISOString()}` : null,
      updatedBefore ? `updatedBefore:${updatedBefore.toISOString()}` : null,
    ].filter(Boolean).join(':');

    const cacheKey = this.redisCacheService.generateListKey(this.CACHE_PREFIX, cacheParams);
    const cachedResult = await this.redisCacheService.get<PaginatedResult<DomesticMovingAllowances>>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Prepare conditions
    const conditions: Record<string, any> = {};
    
    if (distanceStartKm) {
      conditions.distance_start_km = distanceStartKm;
    }

    if (distanceEndKm) {
      conditions.distance_end_km = distanceEndKm;
    }

    if (rateBaht) {
      conditions.rate_baht = rateBaht;
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

    const result = await this.domesticMovingAllowancesRepository.findWithPaginationAndSearch(
      page,
      limit,
      conditions,
      orderBy,
      orderDir.toLowerCase() as 'asc' | 'desc',
      searchTerm
    );

    // Cache the result
    await this.redisCacheService.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  async findById(id: number): Promise<DomesticMovingAllowances> {
    const cacheKey = this.redisCacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedResult = await this.redisCacheService.get<DomesticMovingAllowances>(cacheKey);
    
    if (cachedResult) {
      return cachedResult;
    }

    const result = await this.domesticMovingAllowancesRepository.findById(id);
    if (result) {
      await this.redisCacheService.set(cacheKey, result, this.CACHE_TTL);
    }
    
    return result;
  }

  async create(createDto: CreateDomesticMovingAllowancesDto): Promise<DomesticMovingAllowances> {
    const result = await this.domesticMovingAllowancesRepository.create(createDto);
    await this.invalidateListCache();
    return result;
  }

  async update(id: number, updateDto: UpdateDomesticMovingAllowancesDto): Promise<DomesticMovingAllowances> {
    const existing = await this.domesticMovingAllowancesRepository.findById(id);
    if (!existing) {
      throw new Error('Domestic moving allowance not found');
    }

    const result = await this.domesticMovingAllowancesRepository.update(id, updateDto);
    await this.invalidateCache(id);
    await this.invalidateListCache();
    return result;
  }

  async remove(id: number): Promise<void> {
    const existing = await this.domesticMovingAllowancesRepository.findById(id);
    if (!existing) {
      throw new Error('Domestic moving allowance not found');
    }

    await this.domesticMovingAllowancesRepository.delete(id);
    await this.invalidateCache(id);
    await this.invalidateListCache();
  }

  async findByDistance(distance: number): Promise<DomesticMovingAllowances> {
    const cacheKey = this.redisCacheService.generateKey(this.CACHE_PREFIX, `distance_${distance}`);
    const cachedResult = await this.redisCacheService.get<DomesticMovingAllowances>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const result = await this.domesticMovingAllowancesRepository.findByDistanceRange(distance);
    if (result) {
      await this.redisCacheService.set(cacheKey, result, this.CACHE_TTL);
    }
    return result;
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
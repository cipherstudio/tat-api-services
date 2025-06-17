import { Injectable, NotFoundException } from '@nestjs/common';
import { OfficeInternational } from '../entities/office-international.entity.js';
import { CreateOfficeInternationalDto } from '../dto/create-office-international.dto.js';
import { UpdateOfficeInternationalDto } from '../dto/update-office-international.dto.js';
import { OfficeInternationalQueryOptions } from '../interfaces/office-international-options.interface.js';
import { PaginatedResult } from '@common/interfaces/pagination.interface.js';

import { RedisCacheService } from '../../cache/redis-cache.service.js';
import { OfficeInternationalRepository } from '../repositories/office-international.repository.js';

@Injectable()
export class OfficeInternationalService {
  private readonly CACHE_PREFIX = 'office_international';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly repository: OfficeInternationalRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async create(createOfficeInternationalDto: CreateOfficeInternationalDto): Promise<OfficeInternational> {
    const savedOfficeInternational = await this.repository.create(createOfficeInternationalDto);

    // Cache the new office international
    await this.cacheService.set(
      this.cacheService.generateKey(this.CACHE_PREFIX, savedOfficeInternational.id),
      savedOfficeInternational,
      this.CACHE_TTL
    );

    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

    return savedOfficeInternational;
  }

  async findAll(options: OfficeInternationalQueryOptions): Promise<PaginatedResult<OfficeInternational>> {
    const { 
      page = 1, 
      limit = 10, 
      name, 
      region,
      countryId,
      currencyId,
      searchTerm,
      orderBy = 'created_at',
      orderDir = 'DESC',
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    } = options;

    // Generate cache key that includes all query parameters
    const cacheParams = [
      `page:${page}`,
      `limit:${limit}`,
      `orderBy:${orderBy}`,
      `orderDir:${orderDir}`,
      name ? `name:${name}` : null,
      region ? `region:${region}` : null,
      countryId ? `countryId:${countryId}` : null,
      currencyId ? `currencyId:${currencyId}` : null,
      searchTerm ? `search:${searchTerm}` : null,
      createdAfter ? `createdAfter:${createdAfter.toISOString()}` : null,
      createdBefore ? `createdBefore:${createdBefore.toISOString()}` : null,
      updatedAfter ? `updatedAfter:${updatedAfter.toISOString()}` : null,
      updatedBefore ? `updatedBefore:${updatedBefore.toISOString()}` : null,
    ].filter(Boolean).join(':');

    const cacheKey = this.cacheService.generateListKey(this.CACHE_PREFIX, cacheParams);
    const cachedResult = await this.cacheService.get<PaginatedResult<OfficeInternational>>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Prepare conditions
    const conditions: Record<string, any> = {};
    
    if (name) {
      conditions.name = name;
    }

    if (region) {
      conditions.region = region;
    }

    if (countryId) {
      conditions.country_id = countryId;
    }

    if (currencyId) {
      conditions.currency_id = currencyId;
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

    const result = await this.repository.findWithPaginationAndSearch(
      page,
      limit,
      conditions,
      orderBy,
      orderDir.toLowerCase() as 'asc' | 'desc',
      searchTerm
    );

    // Cache the result
    await this.cacheService.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  async findById(id: number): Promise<OfficeInternational> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedOfficeInternational = await this.cacheService.get<OfficeInternational>(cacheKey);
    if (cachedOfficeInternational) {
      return cachedOfficeInternational;
    }

    const officeInternational = await this.repository.findById(id);
    if (!officeInternational) {
      throw new NotFoundException(`Office International with ID ${id} not found`);
    }

    // Cache the result
    await this.cacheService.set(cacheKey, officeInternational, this.CACHE_TTL);

    return officeInternational;
  }

  async update(id: number, updateOfficeInternationalDto: UpdateOfficeInternationalDto): Promise<OfficeInternational> {
    const officeInternational = await this.findById(id);
    if (!officeInternational) {
      throw new NotFoundException(`Office International with ID ${id} not found`);
    }

    await this.repository.update(id, updateOfficeInternationalDto);
    const updatedOfficeInternational = await this.findById(id);

    // Update cache
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    await this.cacheService.set(cacheKey, updatedOfficeInternational, this.CACHE_TTL);

    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

    return updatedOfficeInternational;
  }

  async remove(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (!result) {
      throw new NotFoundException(`Office International with ID ${id} not found`);
    }

    // Remove from cache
    await this.cacheService.del(this.cacheService.generateKey(this.CACHE_PREFIX, id));
    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));
  }
}

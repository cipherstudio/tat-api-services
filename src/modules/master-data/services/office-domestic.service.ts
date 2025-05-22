import { Injectable, NotFoundException } from '@nestjs/common';
import { OfficeDomestic } from '../entities/office-domestic.entity.js';
import { CreateOfficeDomesticDto } from '../dto/create-office-domestic.dto.js';
import { UpdateOfficeDomesticDto } from '../dto/update-office-domestic.dto.js';
import { OfficeDomesticQueryOptions } from '../interfaces/office-domestic-options.interface.js';
import { PaginatedResult } from '@common/interfaces/pagination.interface.js';

import { RedisCacheService } from '../../cache/redis-cache.service.js';
import { OfficeDomesticRepository } from '../repositories/office-domestic.repository.js';

@Injectable()
export class OfficeDomesticService {
  private readonly CACHE_PREFIX = 'office_domestic';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly repository: OfficeDomesticRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async create(createOfficeDomesticDto: CreateOfficeDomesticDto): Promise<OfficeDomestic> {
    const savedOfficeDomestic = await this.repository.create(createOfficeDomesticDto);

    // Cache the new office domestic
    await this.cacheService.set(
      this.cacheService.generateKey(this.CACHE_PREFIX, savedOfficeDomestic.id),
      savedOfficeDomestic,
      this.CACHE_TTL
    );

    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

    return savedOfficeDomestic;
  }

  async findAll(options: OfficeDomesticQueryOptions): Promise<PaginatedResult<OfficeDomestic>> {
    const { 
      page = 1, 
      limit = 10, 
      name, 
      region,
      isHeadOffice,
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
      isHeadOffice !== undefined ? `isHeadOffice:${isHeadOffice}` : null,
      searchTerm ? `search:${searchTerm}` : null,
      createdAfter ? `createdAfter:${createdAfter.toISOString()}` : null,
      createdBefore ? `createdBefore:${createdBefore.toISOString()}` : null,
      updatedAfter ? `updatedAfter:${updatedAfter.toISOString()}` : null,
      updatedBefore ? `updatedBefore:${updatedBefore.toISOString()}` : null,
    ].filter(Boolean).join(':');

    const cacheKey = this.cacheService.generateListKey(this.CACHE_PREFIX, cacheParams);
    const cachedResult = await this.cacheService.get<PaginatedResult<OfficeDomestic>>(cacheKey);
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

    if (isHeadOffice !== undefined) {
      conditions.is_head_office = isHeadOffice;
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

  async findById(id: number): Promise<OfficeDomestic> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedOfficeDomestic = await this.cacheService.get<OfficeDomestic>(cacheKey);
    if (cachedOfficeDomestic) {
      return cachedOfficeDomestic;
    }

    const officeDomestic = await this.repository.findById(id);
    if (!officeDomestic) {
      throw new NotFoundException(`Office Domestic with ID ${id} not found`);
    }

    // Cache the result
    await this.cacheService.set(cacheKey, officeDomestic, this.CACHE_TTL);

    return officeDomestic;
  }

  async update(id: number, updateOfficeDomesticDto: UpdateOfficeDomesticDto): Promise<OfficeDomestic> {
    const officeDomestic = await this.findById(id);
    if (!officeDomestic) {
      throw new NotFoundException(`Office Domestic with ID ${id} not found`);
    }

    await this.repository.update(id, updateOfficeDomesticDto);
    const updatedOfficeDomestic = await this.findById(id);

    // Update cache
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    await this.cacheService.set(cacheKey, updatedOfficeDomestic, this.CACHE_TTL);

    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

    return updatedOfficeDomestic;
  }

  async remove(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (!result) {
      throw new NotFoundException(`Office Domestic with ID ${id} not found`);
    }

    // Remove from cache
    await this.cacheService.del(this.cacheService.generateKey(this.CACHE_PREFIX, id));
    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));
  }
} 
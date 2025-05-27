import { Injectable, NotFoundException } from '@nestjs/common';
import { ProvincesRepository } from '../repositories/provinces.repository';
import { Provinces } from '../entities/provinces.entity';
import { CreateProvincesDto } from '../dto/create-provinces.dto';
import { UpdateProvincesDto } from '../dto/update-provinces.dto';
import { ProvincesQueryDto } from '../dto/provinces-query.dto';
import { PaginatedResult } from '@common/interfaces/pagination.interface';
import { RedisCacheService } from '../../cache/redis-cache.service';

@Injectable()
export class ProvincesService {
  private readonly CACHE_PREFIX = 'provinces';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly provincesRepository: ProvincesRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async create(createProvincesDto: CreateProvincesDto): Promise<Provinces> {
    const savedProvinces = await this.provincesRepository.create(createProvincesDto);

    // Cache the new province
    await this.cacheService.set(
      this.cacheService.generateKey(this.CACHE_PREFIX, savedProvinces.id),
      savedProvinces,
      this.CACHE_TTL
    );

    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

    return savedProvinces;
  }

  async findAll(queryOptions?: ProvincesQueryDto): Promise<PaginatedResult<Provinces>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      orderDir = 'DESC',
      nameEn,
      nameTh,
      isPerimeter,
      searchTerm,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    } = queryOptions || {};

    // Generate cache key that includes all query parameters
    const cacheParams = [
      `page:${page}`,
      `limit:${limit}`,
      `orderBy:${orderBy}`,
      `orderDir:${orderDir}`,
      nameEn ? `nameEn:${nameEn}` : null,
      nameTh ? `nameTh:${nameTh}` : null,
      isPerimeter !== undefined ? `isPerimeter:${isPerimeter}` : null,
      searchTerm ? `search:${searchTerm}` : null,
      createdAfter ? `createdAfter:${createdAfter.toISOString()}` : null,
      createdBefore ? `createdBefore:${createdBefore.toISOString()}` : null,
      updatedAfter ? `updatedAfter:${updatedAfter.toISOString()}` : null,
      updatedBefore ? `updatedBefore:${updatedBefore.toISOString()}` : null,
    ].filter(Boolean).join(':');

    const cacheKey = this.cacheService.generateListKey(this.CACHE_PREFIX, cacheParams);
    const cachedResult = await this.cacheService.get<PaginatedResult<Provinces>>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Prepare conditions
    const conditions: Record<string, any> = {};
    
    if (nameEn) {
      conditions.name_en = nameEn;
    }

    if (nameTh) {
      conditions.name_th = nameTh;
    }

    if (isPerimeter !== undefined) {
      conditions.is_perimeter = isPerimeter;
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

    const result = await this.provincesRepository.findWithPaginationAndSearch(
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

  async findById(id: number): Promise<Provinces> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedProvinces = await this.cacheService.get<Provinces>(cacheKey);
    if (cachedProvinces) {
      return cachedProvinces;
    }

    const provinces = await this.provincesRepository.findById(id);
    if (!provinces) {
      throw new NotFoundException(`Provinces with ID ${id} not found`);
    }

    // Cache the result
    await this.cacheService.set(cacheKey, provinces, this.CACHE_TTL);

    return provinces;
  }

  async update(id: number, updateProvincesDto: UpdateProvincesDto): Promise<Provinces> {
    const provinces = await this.findById(id);
    if (!provinces) {
      throw new NotFoundException(`Provinces with ID ${id} not found`);
    }

    await this.provincesRepository.update(id, updateProvincesDto);
    const updatedProvinces = await this.findById(id);

    // Update cache
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    await this.cacheService.set(cacheKey, updatedProvinces, this.CACHE_TTL);

    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

    return updatedProvinces;
  }

  async remove(id: number): Promise<void> {
    const result = await this.provincesRepository.delete(id);
    if (!result) {
      throw new NotFoundException(`Provinces with ID ${id} not found`);
    }

    // Remove from cache
    await this.cacheService.del(this.cacheService.generateKey(this.CACHE_PREFIX, id));
    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));
  }
} 
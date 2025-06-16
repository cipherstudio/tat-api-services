import { Injectable } from '@nestjs/common';
import { InternationalMovingAllowancesRepository } from '../repositories/international-moving-allowances.repository';
import { RedisCacheService } from '../../cache/redis-cache.service';
import { CreateInternationalMovingAllowancesDto } from '../dto/create-international-moving-allowances.dto';
import { UpdateInternationalMovingAllowancesDto } from '../dto/update-international-moving-allowances.dto';
import { InternationalMovingAllowancesQueryDto } from '../dto/international-moving-allowances-query.dto';
import { InternationalMovingAllowances } from '../entities/international-moving-allowances.entity';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';

@Injectable()
export class InternationalMovingAllowancesService {
  private readonly CACHE_PREFIX = 'international_moving_allowances';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    private readonly internationalMovingAllowancesRepository: InternationalMovingAllowancesRepository,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async findAll(query: any): Promise<PaginatedResult<InternationalMovingAllowances>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      orderDir = 'DESC',
      office,
      currency,
      directorSalary,
      deputyDirectorSalary,
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
      office ? `office:${office}` : null,
      currency ? `currency:${currency}` : null,
      directorSalary ? `directorSalary:${directorSalary}` : null,
      deputyDirectorSalary ? `deputyDirectorSalary:${deputyDirectorSalary}` : null,
      searchTerm ? `search:${searchTerm}` : null,
      createdAfter ? `createdAfter:${createdAfter.toISOString()}` : null,
      createdBefore ? `createdBefore:${createdBefore.toISOString()}` : null,
      updatedAfter ? `updatedAfter:${updatedAfter.toISOString()}` : null,
      updatedBefore ? `updatedBefore:${updatedBefore.toISOString()}` : null,
    ].filter(Boolean).join(':');

    const cacheKey = this.redisCacheService.generateListKey(this.CACHE_PREFIX, cacheParams);
    const cachedResult = await this.redisCacheService.get<PaginatedResult<InternationalMovingAllowances>>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Prepare conditions
    const conditions: Record<string, any> = {};
    
    if (office) {
      conditions.office = office;
    }

    if (currency) {
      conditions.currency = currency;
    }

    if (directorSalary) {
      conditions.director_salary = directorSalary;
    }

    if (deputyDirectorSalary) {
      conditions.deputy_director_salary = deputyDirectorSalary;
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

    const result = await this.internationalMovingAllowancesRepository.findWithPaginationAndSearch(
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

  async findById(id: number): Promise<InternationalMovingAllowances> {
    const cacheKey = this.redisCacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedResult = await this.redisCacheService.get<InternationalMovingAllowances>(cacheKey);
    
    if (cachedResult) {
      return cachedResult;
    }

    const result = await this.internationalMovingAllowancesRepository.findById(id);
    if (result) {
      await this.redisCacheService.set(cacheKey, result, this.CACHE_TTL);
    }
    
    return result;
  }

  async findByOffice(office: string): Promise<InternationalMovingAllowances | undefined> {
    return this.internationalMovingAllowancesRepository.findByOffice(office);
  }

  async create(createDto: CreateInternationalMovingAllowancesDto): Promise<InternationalMovingAllowances> {
    const result = await this.internationalMovingAllowancesRepository.create(createDto);
    await this.invalidateListCache();
    return result;
  }

  async update(id: number, updateDto: UpdateInternationalMovingAllowancesDto): Promise<InternationalMovingAllowances> {
    const existing = await this.internationalMovingAllowancesRepository.findById(id);
    if (!existing) {
      throw new Error('International moving allowance not found');
    }

    const result = await this.internationalMovingAllowancesRepository.update(id, updateDto);
    await this.invalidateCache(id);
    await this.invalidateListCache();
    return result;
  }

  async remove(id: number): Promise<void> {
    const existing = await this.internationalMovingAllowancesRepository.findById(id);
    if (!existing) {
      throw new Error('International moving allowance not found');
    }

    await this.internationalMovingAllowancesRepository.delete(id);
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
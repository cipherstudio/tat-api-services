import { Injectable, NotFoundException } from '@nestjs/common';
import { OutsiderEquivalent } from '../entities/outsider-equivalent.entity.js';
import { CreateOutsiderEquivalentDto } from '../dto/outsider-equivalent.dto.js';
import { UpdateOutsiderEquivalentDto } from '../dto/outsider-equivalent.dto.js';
import { RedisCacheService } from '../../cache/redis-cache.service.js';
import { OutsiderEquivalentRepository } from '../repositories/outsider-equivalent.repository.js';

@Injectable()
export class OutsiderEquivalentService {
  private readonly CACHE_PREFIX = 'outsider_equivalent';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly repository: OutsiderEquivalentRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async create(createOutsiderEquivalentDto: CreateOutsiderEquivalentDto): Promise<OutsiderEquivalent> {
    const savedOutsiderEquivalent = await this.repository.create(createOutsiderEquivalentDto);

    // Cache the new outsider equivalent
    await this.cacheService.set(
      this.cacheService.generateKey(this.CACHE_PREFIX, savedOutsiderEquivalent.id),
      savedOutsiderEquivalent,
      this.CACHE_TTL
    );

    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

    return savedOutsiderEquivalent;
  }

  async findAll(params?: {
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDir?: 'ASC' | 'DESC';
    name?: string;
    searchTerm?: string;
    createdAfter?: Date;
    createdBefore?: Date;
    updatedAfter?: Date;
    updatedBefore?: Date;
  }): Promise<{ data: OutsiderEquivalent[]; meta: { total: number; page: number; limit: number; lastPage: number } }> {
    // Try to get from cache first if no search/filter params
    if (!params || Object.keys(params).length === 0) {
      const cacheKey = this.cacheService.generateListKey(this.CACHE_PREFIX);
      const cachedOutsiderEquivalents = await this.cacheService.get<OutsiderEquivalent[]>(cacheKey);
      if (cachedOutsiderEquivalents) {
        return {
          data: cachedOutsiderEquivalents,
          meta: {
            total: cachedOutsiderEquivalents.length,
            page: 1,
            limit: cachedOutsiderEquivalents.length,
            lastPage: 1,
          },
        };
      }
    }

    const conditions: Record<string, any> = {};
    if (params?.name) conditions.name = params.name;
    if (params?.createdAfter) conditions.created_at = { $gte: params.createdAfter };
    if (params?.createdBefore) conditions.created_at = { ...conditions.created_at, $lte: params.createdBefore };
    if (params?.updatedAfter) conditions.updated_at = { $gte: params.updatedAfter };
    if (params?.updatedBefore) conditions.updated_at = { ...conditions.updated_at, $lte: params.updatedBefore };

    const result = await this.repository.findWithPaginationAndSearch(
      params?.page || 1,
      params?.limit || 10,
      conditions,
      params?.orderBy || 'id',
      (params?.orderDir || 'ASC').toLowerCase() as 'asc' | 'desc',
      params?.searchTerm,
    );

    // Cache the result if no search/filter params
    if (!params || Object.keys(params).length === 0) {
      const cacheKey = this.cacheService.generateListKey(this.CACHE_PREFIX);
      await this.cacheService.set(cacheKey, result.data, this.CACHE_TTL);
    }

    return result;
  }

  async findById(id: number): Promise<OutsiderEquivalent> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedOutsiderEquivalent = await this.cacheService.get<OutsiderEquivalent>(cacheKey);
    if (cachedOutsiderEquivalent) {
      return cachedOutsiderEquivalent;
    }

    const outsiderEquivalent = await this.repository.findById(id);
    if (!outsiderEquivalent) {
      throw new NotFoundException(`Outsider equivalent with ID ${id} not found`);
    }

    // Cache the result
    await this.cacheService.set(cacheKey, outsiderEquivalent, this.CACHE_TTL);

    return outsiderEquivalent;
  }

  async update(id: number, updateOutsiderEquivalentDto: UpdateOutsiderEquivalentDto): Promise<OutsiderEquivalent> {
    const outsiderEquivalent = await this.findById(id);
    if (!outsiderEquivalent) {
      throw new NotFoundException(`Outsider equivalent with ID ${id} not found`);
    }

    await this.repository.update(id, updateOutsiderEquivalentDto);
    const updatedOutsiderEquivalent = await this.findById(id);

    // Update cache
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    await this.cacheService.set(cacheKey, updatedOutsiderEquivalent, this.CACHE_TTL);

    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

    return updatedOutsiderEquivalent;
  }

  async delete(id: number): Promise<void> {
    const outsiderEquivalent = await this.findById(id);
    if (!outsiderEquivalent) {
      throw new NotFoundException(`Outsider equivalent with ID ${id} not found`);
    }

    await this.repository.delete(id);

    // Remove from cache
    await this.cacheService.del(this.cacheService.generateKey(this.CACHE_PREFIX, id));
    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));
  }
} 
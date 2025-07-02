import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfidentialAccessControl } from '../entities/confidential-access-control.entity';
import { CreateConfidentialAccessControlDto } from '../dto/create-confidential-access-control.dto';
import { UpdateConfidentialAccessControlDto } from '../dto/update-confidential-access-control.dto';
import { ConfidentialAccessControlQueryOptions } from '../interfaces/confidential-access-control-options.interface';
import { PaginatedResult } from '@common/interfaces/pagination.interface';
import { RedisCacheService } from '../../cache/redis-cache.service';
import { ConfidentialAccessControlRepository } from '../repositories/confidential-access-control.repository';

@Injectable()
export class ConfidentialAccessControlService {
  private readonly CACHE_PREFIX = 'confidential_access_control';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly confidentialAccessControlRepository: ConfidentialAccessControlRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async create(createConfidentialAccessControlDto: CreateConfidentialAccessControlDto): Promise<ConfidentialAccessControl> {
    const savedConfidentialAccessControl = await this.confidentialAccessControlRepository.create(createConfidentialAccessControlDto);

    // Cache the new record
    await this.cacheService.set(
      this.cacheService.generateKey(this.CACHE_PREFIX, savedConfidentialAccessControl.id),
      savedConfidentialAccessControl,
      this.CACHE_TTL
    );

    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

    return savedConfidentialAccessControl;
  }

  async findAll(queryOptions?: ConfidentialAccessControlQueryOptions): Promise<PaginatedResult<ConfidentialAccessControl>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      orderDir = 'DESC',
      position,
      confidentialLevel,
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
      position ? `position:${position}` : null,
      confidentialLevel ? `confidentialLevel:${confidentialLevel}` : null,
      searchTerm ? `search:${searchTerm}` : null,
      createdAfter ? `createdAfter:${createdAfter.toISOString()}` : null,
      createdBefore ? `createdBefore:${createdBefore.toISOString()}` : null,
      updatedAfter ? `updatedAfter:${updatedAfter.toISOString()}` : null,
      updatedBefore ? `updatedBefore:${updatedBefore.toISOString()}` : null,
    ].filter(Boolean).join(':');

    const cacheKey = this.cacheService.generateListKey(this.CACHE_PREFIX, cacheParams);
    const cachedResult = await this.cacheService.get<PaginatedResult<ConfidentialAccessControl>>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Prepare conditions
    const conditions: Record<string, any> = {};
    
    if (position) {
      conditions.position = position;
    }

    if (confidentialLevel) {
      conditions.confidential_level = confidentialLevel;
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

    const result = await this.confidentialAccessControlRepository.findWithPaginationAndSearch(
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

  async findById(id: number): Promise<ConfidentialAccessControl> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedConfidentialAccessControl = await this.cacheService.get<ConfidentialAccessControl>(cacheKey);
    if (cachedConfidentialAccessControl) {
      return cachedConfidentialAccessControl;
    }

    const confidentialAccessControl = await this.confidentialAccessControlRepository.findById(id);
    if (!confidentialAccessControl) {
      throw new NotFoundException(`Confidential Access Control with ID ${id} not found`);
    }

    // Cache the result
    await this.cacheService.set(cacheKey, confidentialAccessControl, this.CACHE_TTL);

    return confidentialAccessControl;
  }

  async update(id: number, updateConfidentialAccessControlDto: UpdateConfidentialAccessControlDto): Promise<ConfidentialAccessControl> {
    const confidentialAccessControl = await this.findById(id);
    if (!confidentialAccessControl) {
      throw new NotFoundException(`Confidential Access Control with ID ${id} not found`);
    }

    await this.confidentialAccessControlRepository.update(id, updateConfidentialAccessControlDto);
    const updatedConfidentialAccessControl = await this.findById(id);

    // Update cache
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    await this.cacheService.set(cacheKey, updatedConfidentialAccessControl, this.CACHE_TTL);

    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

    return updatedConfidentialAccessControl;
  }

  async remove(id: number): Promise<void> {
    const result = await this.confidentialAccessControlRepository.delete(id);
    if (!result) {
      throw new NotFoundException(`Confidential Access Control with ID ${id} not found`);
    }

    // Remove from cache
    await this.cacheService.del(this.cacheService.generateKey(this.CACHE_PREFIX, id));
    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));
  }
} 
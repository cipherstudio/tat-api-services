import { Injectable, NotFoundException } from '@nestjs/common';
import { CommitteePosition } from '../entities/committee-position.entity.js';
import { CreateCommitteePositionDto } from '../dto/committee-position.dto.js';
import { UpdateCommitteePositionDto } from '../dto/committee-position.dto.js';
import { RedisCacheService } from '../../cache/redis-cache.service.js';
import { CommitteePositionRepository } from '../repositories/committee-position.repository.js';

@Injectable()
export class CommitteePositionService {
  private readonly CACHE_PREFIX = 'committee_position';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly repository: CommitteePositionRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async create(createCommitteePositionDto: CreateCommitteePositionDto): Promise<CommitteePosition> {
    const savedCommitteePosition = await this.repository.create(createCommitteePositionDto);

    // Cache the new committee position
    await this.cacheService.set(
      this.cacheService.generateKey(this.CACHE_PREFIX, savedCommitteePosition.id),
      savedCommitteePosition,
      this.CACHE_TTL
    );

    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

    return savedCommitteePosition;
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
  }): Promise<{ data: CommitteePosition[]; meta: { total: number; page: number; limit: number; lastPage: number } }> {
    // Try to get from cache first if no search/filter params
    if (!params || Object.keys(params).length === 0) {
      const cacheKey = this.cacheService.generateListKey(this.CACHE_PREFIX);
      const cachedCommitteePositions = await this.cacheService.get<CommitteePosition[]>(cacheKey);
      if (cachedCommitteePositions) {
        return {
          data: cachedCommitteePositions,
          meta: {
            total: cachedCommitteePositions.length,
            page: 1,
            limit: cachedCommitteePositions.length,
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

  async findById(id: number): Promise<CommitteePosition> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedCommitteePosition = await this.cacheService.get<CommitteePosition>(cacheKey);
    if (cachedCommitteePosition) {
      return cachedCommitteePosition;
    }

    const committeePosition = await this.repository.findById(id);
    if (!committeePosition) {
      throw new NotFoundException(`Committee position with ID ${id} not found`);
    }

    // Cache the result
    await this.cacheService.set(cacheKey, committeePosition, this.CACHE_TTL);

    return committeePosition;
  }

  async update(id: number, updateCommitteePositionDto: UpdateCommitteePositionDto): Promise<CommitteePosition> {
    const committeePosition = await this.findById(id);
    if (!committeePosition) {
      throw new NotFoundException(`Committee position with ID ${id} not found`);
    }

    await this.repository.update(id, updateCommitteePositionDto);
    const updatedCommitteePosition = await this.findById(id);

    // Update cache
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    await this.cacheService.set(cacheKey, updatedCommitteePosition, this.CACHE_TTL);

    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

    return updatedCommitteePosition;
  }

  async delete(id: number): Promise<void> {
    const committeePosition = await this.findById(id);
    if (!committeePosition) {
      throw new NotFoundException(`Committee position with ID ${id} not found`);
    }

    await this.repository.delete(id);

    // Remove from cache
    await this.cacheService.del(this.cacheService.generateKey(this.CACHE_PREFIX, id));
    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));
  }
} 
import { Injectable, NotFoundException } from '@nestjs/common';
import { Privilege } from '../entities/privilege.entity.js';
import { CreatePrivilegeDto } from '../dto/privilege.dto.js';
import { UpdatePrivilegeDto } from '../dto/privilege.dto.js';
import { RedisCacheService } from '../../cache/redis-cache.service.js';
import { PrivilegeRepository } from '../repositories/privilege.repository.js';

@Injectable()
export class PrivilegeService {
  private readonly CACHE_PREFIX = 'privilege';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly repository: PrivilegeRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async create(createPrivilegeDto: CreatePrivilegeDto): Promise<Privilege> {
    const savedPrivilege = await this.repository.create(createPrivilegeDto);

    // Cache the new privilege
    await this.cacheService.set(
      this.cacheService.generateKey(this.CACHE_PREFIX, savedPrivilege.id),
      savedPrivilege,
      this.CACHE_TTL
    );

    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

    return savedPrivilege;
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
    isCommitteePosition?: boolean;
    isOutsiderEquivalent?: boolean;
  }): Promise<{ data: Privilege[]; meta: { total: number; page: number; limit: number; lastPage: number } }> {
    // Try to get from cache first if no search/filter params
    if (!params || Object.keys(params).length === 0) {
      const cacheKey = this.cacheService.generateListKey(this.CACHE_PREFIX);
      const cachedPrivileges = await this.cacheService.get<Privilege[]>(cacheKey);
      if (cachedPrivileges) {
        return {
          data: cachedPrivileges,
          meta: {
            total: cachedPrivileges.length,
            page: 1,
            limit: cachedPrivileges.length,
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
    if (params?.isCommitteePosition !== undefined) conditions.is_committee_position = params.isCommitteePosition;
    if (params?.isOutsiderEquivalent !== undefined) conditions.is_outsider_equivalent = params.isOutsiderEquivalent;

    const result = await this.repository.findWithPaginationAndSearch(
      params?.page || 1,
      params?.limit || 50,
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

  async findById(id: number): Promise<Privilege> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedPrivilege = await this.cacheService.get<Privilege>(cacheKey);
    if (cachedPrivilege) {
      return cachedPrivilege;
    }

    const privilege = await this.repository.findById(id);
    if (!privilege) {
      throw new NotFoundException(`Privilege with ID ${id} not found`);
    }

    // Cache the result
    await this.cacheService.set(cacheKey, privilege, this.CACHE_TTL);

    return privilege;
  }

  async update(id: number, updatePrivilegeDto: UpdatePrivilegeDto): Promise<Privilege> {
    const privilege = await this.findById(id);
    if (!privilege) {
      throw new NotFoundException(`Privilege with ID ${id} not found`);
    }

    await this.repository.update(id, updatePrivilegeDto);
    const updatedPrivilege = await this.findById(id);

    // Update cache
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    await this.cacheService.set(cacheKey, updatedPrivilege, this.CACHE_TTL);

    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

    return updatedPrivilege;
  }

  async delete(id: number): Promise<void> {
    const privilege = await this.findById(id);
    if (!privilege) {
      throw new NotFoundException(`Privilege with ID ${id} not found`);
    }

    await this.repository.delete(id);

    // Remove from cache
    await this.cacheService.del(this.cacheService.generateKey(this.CACHE_PREFIX, id));
    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));
  }
} 
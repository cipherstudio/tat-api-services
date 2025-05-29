import { Injectable, NotFoundException } from '@nestjs/common';
import { AmphursRepository } from '../repositories/amphurs.repository';
import { Amphurs } from '../entities/amphurs.entity';
import { CreateAmphursDto } from '../dto/create-amphurs.dto';
import { UpdateAmphursDto } from '../dto/update-amphurs.dto';
import { AmphursQueryDto } from '../dto/amphurs-query.dto';
import { PaginatedResult } from '@common/interfaces/pagination.interface';
import { RedisCacheService } from '../../cache/redis-cache.service';

@Injectable()
export class AmphursService {
  private readonly CACHE_PREFIX = 'amphurs';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly amphursRepository: AmphursRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async create(createAmphursDto: CreateAmphursDto): Promise<Amphurs> {
    const savedAmphurs = await this.amphursRepository.create(createAmphursDto);

    // Cache the new amphur
    await this.cacheService.set(
      this.cacheService.generateKey(this.CACHE_PREFIX, savedAmphurs.id),
      savedAmphurs,
      this.CACHE_TTL
    );

    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

    return savedAmphurs;
  }

  async findAll(queryOptions?: AmphursQueryDto): Promise<PaginatedResult<Amphurs>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      orderDir = 'DESC',
      nameEn,
      nameTh,
      provinceId,
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
      provinceId ? `provinceId:${provinceId}` : null,
      searchTerm ? `search:${searchTerm}` : null,
      createdAfter ? `createdAfter:${createdAfter.toISOString()}` : null,
      createdBefore ? `createdBefore:${createdBefore.toISOString()}` : null,
      updatedAfter ? `updatedAfter:${updatedAfter.toISOString()}` : null,
      updatedBefore ? `updatedBefore:${updatedBefore.toISOString()}` : null,
    ].filter(Boolean).join(':');

    const cacheKey = this.cacheService.generateListKey(this.CACHE_PREFIX, cacheParams);
    const cachedResult = await this.cacheService.get<PaginatedResult<Amphurs>>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const conditions: Record<string, any> = {};

    if (nameEn) {
      conditions.name_en = nameEn;
    }
    if (nameTh) {
      conditions.name_th = nameTh;
    }
    if (provinceId) {
      conditions.province_id = provinceId;
    }
    if (searchTerm) {
      conditions.searchTerm = searchTerm;
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

    const result = await this.amphursRepository.findWithPagination(
      page,
      limit,
      conditions,
      orderBy,
      orderDir.toLowerCase() as 'asc' | 'desc'
    );

    // Add lastPage to meta
    const lastPage = Math.ceil(result.meta.total / result.meta.limit);
    const paginatedResult: PaginatedResult<Amphurs> = {
      data: result.data,
      meta: {
        ...result.meta,
        lastPage,
      },
    };

    // Cache the result
    await this.cacheService.set(cacheKey, paginatedResult, this.CACHE_TTL);

    return paginatedResult;
  }

  async findById(id: number): Promise<Amphurs> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedAmphurs = await this.cacheService.get<Amphurs>(cacheKey);
    if (cachedAmphurs) {
      return cachedAmphurs;
    }

    const amphurs = await this.amphursRepository.findById(id);
    if (!amphurs) {
      throw new NotFoundException(`Amphurs with ID ${id} not found`);
    }

    // Cache the result
    await this.cacheService.set(cacheKey, amphurs, this.CACHE_TTL);

    return amphurs;
  }

  async update(id: number, updateAmphursDto: UpdateAmphursDto): Promise<Amphurs> {
    const amphurs = await this.findById(id);
    if (!amphurs) {
      throw new NotFoundException(`Amphurs with ID ${id} not found`);
    }

    await this.amphursRepository.update(id, updateAmphursDto);
    const updatedAmphurs = await this.findById(id);

    // Update cache
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    await this.cacheService.set(cacheKey, updatedAmphurs, this.CACHE_TTL);

    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

    return updatedAmphurs;
  }

  async remove(id: number): Promise<void> {
    const result = await this.amphursRepository.delete(id);
    if (!result) {
      throw new NotFoundException(`Amphurs with ID ${id} not found`);
    }

    // Remove from cache
    await this.cacheService.del(this.cacheService.generateKey(this.CACHE_PREFIX, id));
    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));
  }
} 
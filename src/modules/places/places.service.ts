import { Injectable, NotFoundException } from '@nestjs/common';
import { PlacesRepository } from './repositories/places.repository';
import { Places } from './entities/places.entity';
import { CreatePlacesDto } from './dto/create-places.dto';
import { UpdatePlacesDto } from './dto/update-places.dto';
import { PlacesQueryDto } from './dto/places-query.dto';
import { RedisCacheService } from '../cache/redis-cache.service';
import { PlacesQueryOptions } from './interfaces/places-options.interface';
import { PaginatedResult } from '@common/interfaces/pagination.interface';

@Injectable()
export class PlacesService {
  private readonly CACHE_PREFIX = 'places';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly placesRepository: PlacesRepository,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async findAll(queryOptions?: PlacesQueryOptions): Promise<PaginatedResult<Places>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      orderDir = 'DESC',
      name,
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
      name ? `name:${name}` : null,
      searchTerm ? `search:${searchTerm}` : null,
      createdAfter ? `createdAfter:${createdAfter.toISOString()}` : null,
      createdBefore ? `createdBefore:${createdBefore.toISOString()}` : null,
      updatedAfter ? `updatedAfter:${updatedAfter.toISOString()}` : null,
      updatedBefore ? `updatedBefore:${updatedBefore.toISOString()}` : null,
    ].filter(Boolean).join(':');

    const cacheKey = this.redisCacheService.generateListKey(this.CACHE_PREFIX, cacheParams);
    const cachedResult = await this.redisCacheService.get<PaginatedResult<Places>>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Prepare conditions
    const conditions: Record<string, any> = {};
    
    if (name) {
      conditions.name = name;
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

    const result = await this.placesRepository.findWithPaginationAndSearch(
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

  async findById(id: number): Promise<Places> {
    // Try to get from cache first
    const cacheKey = this.redisCacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedPlace = await this.redisCacheService.get<Places>(cacheKey);
    if (cachedPlace) {
      return cachedPlace;
    }

    const place = await this.placesRepository.findById(id);
    if (!place) {
      throw new NotFoundException(`Place with ID ${id} not found`);
    }

    // Cache the result
    await this.redisCacheService.set(cacheKey, place, this.CACHE_TTL);

    return place;
  }

  async create(createPlacesDto: CreatePlacesDto): Promise<Places> {
    const savedPlace = await this.placesRepository.create(createPlacesDto);

    // Cache the new place
    await this.redisCacheService.set(
      this.redisCacheService.generateKey(this.CACHE_PREFIX, savedPlace.id),
      savedPlace,
      this.CACHE_TTL
    );

    // Invalidate the list cache
    await this.redisCacheService.del(this.redisCacheService.generateListKey(this.CACHE_PREFIX));

    return savedPlace;
  }

  async update(id: number, updatePlacesDto: UpdatePlacesDto): Promise<Places> {
    const place = await this.findById(id);
    if (!place) {
      throw new NotFoundException(`Place with ID ${id} not found`);
    }

    await this.placesRepository.update(id, updatePlacesDto);
    const updatedPlace = await this.findById(id);

    // Update cache
    const cacheKey = this.redisCacheService.generateKey(this.CACHE_PREFIX, id);
    await this.redisCacheService.set(cacheKey, updatedPlace, this.CACHE_TTL);

    // Invalidate the list cache
    await this.redisCacheService.del(this.redisCacheService.generateListKey(this.CACHE_PREFIX));

    return updatedPlace;
  }

  async remove(id: number): Promise<void> {
    const result = await this.placesRepository.delete(id);
    if (!result) {
      throw new NotFoundException(`Place with ID ${id} not found`);
    }

    // Remove from cache
    await this.redisCacheService.del(this.redisCacheService.generateKey(this.CACHE_PREFIX, id));
    // Invalidate the list cache
    await this.redisCacheService.del(this.redisCacheService.generateListKey(this.CACHE_PREFIX));
  }
} 
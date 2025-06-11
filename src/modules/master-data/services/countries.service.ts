    import { Injectable, NotFoundException } from '@nestjs/common';
    import { Countries } from '../entities/countries.entity.js';
    import { CreateCountriesDto } from '../dto/create-countries.dto.js';
    import { UpdateCountriesDto } from '../dto/update-countries.dto.js';
    import { CountriesQueryOptions } from '../interfaces/countries-options.interface.js';
    import { PaginatedResult } from '@common/interfaces/pagination.interface.js';
    import { RedisCacheService } from '../../cache/redis-cache.service.js';
    import { CountriesRepository } from '../repositories/countries.repository.js';

    @Injectable()
    export class CountriesService {
      private readonly CACHE_PREFIX = 'countries';
      private readonly CACHE_TTL = 3600; // 1 hour in seconds

      constructor(
        private readonly countriesRepository: CountriesRepository,
        private readonly cacheService: RedisCacheService,
      ) {}

      async create(createCountriesDto: CreateCountriesDto): Promise<Countries> {
        const savedCountries = await this.countriesRepository.create(createCountriesDto);

        // Cache the new countries
        await this.cacheService.set(
          this.cacheService.generateKey(this.CACHE_PREFIX, savedCountries.id),
          savedCountries,
          this.CACHE_TTL
        );

        // Invalidate the list cache
        await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

        return savedCountries;
      }

      async findAll(queryOptions?: CountriesQueryOptions): Promise<PaginatedResult<Countries>> {
        const {
          page = 1,
          limit = 10,
          orderBy = 'created_at',
          orderDir = 'DESC',
          nameEn,
          nameTh,
          code,
          searchTerm,
          createdAfter,
          createdBefore,
          updatedAfter,
          updatedBefore,
          type,
        } = queryOptions || {};

        // Generate cache key that includes all query parameters
        const cacheParams = [
          `page:${page}`,
          `limit:${limit}`,
          `orderBy:${orderBy}`,
          `orderDir:${orderDir}`,
          nameEn ? `nameEn:${nameEn}` : null,
          nameTh ? `nameTh:${nameTh}` : null,
          code ? `code:${code}` : null,
          searchTerm ? `search:${searchTerm}` : null,
          createdAfter ? `createdAfter:${createdAfter.toISOString()}` : null,
          createdBefore ? `createdBefore:${createdBefore.toISOString()}` : null,
          updatedAfter ? `updatedAfter:${updatedAfter.toISOString()}` : null,
          updatedBefore ? `updatedBefore:${updatedBefore.toISOString()}` : null,
          type ? `type:${type}` : null,
        ].filter(Boolean).join(':');

        const cacheKey = this.cacheService.generateListKey(this.CACHE_PREFIX, cacheParams);
        const cachedResult = await this.cacheService.get<PaginatedResult<Countries>>(cacheKey);
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

        if (code) {
          conditions.code = code;
        }

        if (type) {
          conditions.type = type;
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

        const result = await this.countriesRepository.findWithPaginationAndSearch(
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

      async findById(id: number): Promise<Countries> {
        // Try to get from cache first
        const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
        const cachedCountries = await this.cacheService.get<Countries>(cacheKey);
        if (cachedCountries) {
          return cachedCountries;
        }

        const countries = await this.countriesRepository.findById(id);
        if (!countries) {
          throw new NotFoundException(`Countries with ID ${id} not found`);
        }

        // Cache the result
        await this.cacheService.set(cacheKey, countries, this.CACHE_TTL);

        return countries;
      }

      async update(id: number, updateCountriesDto: UpdateCountriesDto): Promise<Countries> {
        const countries = await this.findById(id);
        if (!countries) {
          throw new NotFoundException(`Countries with ID ${id} not found`);
        }

        await this.countriesRepository.update(id, updateCountriesDto);
        const updatedCountries = await this.findById(id);

        // Update cache
        const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
        await this.cacheService.set(cacheKey, updatedCountries, this.CACHE_TTL);

        // Invalidate the list cache
        await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

        return updatedCountries;
      }

      async remove(id: number): Promise<void> {
        const result = await this.countriesRepository.delete(id);
        if (!result) {
          throw new NotFoundException(`Countries with ID ${id} not found`);
        }

        // Remove from cache
        await this.cacheService.del(this.cacheService.generateKey(this.CACHE_PREFIX, id));
        // Invalidate the list cache
        await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));
      }
    }

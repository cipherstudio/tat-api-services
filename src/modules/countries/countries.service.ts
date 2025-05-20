import { Injectable, NotFoundException } from '@nestjs/common';
import { Countries } from './entities/countries.entity';
import { CreateCountriesDto } from './dto/create-countries.dto';
import { UpdateCountriesDto } from './dto/update-countries.dto';
import { QueryCountriesDto } from './dto/query-countries.dto';
import { RedisCacheService } from '../cache/redis-cache.service';
import { CountriesRepository } from './repositories/countries.repository';

@Injectable()
export class CountriesService {
  private readonly CACHE_PREFIX = 'countries';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly countriesRepository: CountriesRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async create(createCountriesDto: CreateCountriesDto): Promise<Countries> {
    const savedCountry = await this.countriesRepository.create(createCountriesDto);

    try {
      // Cache the new country
      await this.cacheService.set(
        this.cacheService.generateKey(this.CACHE_PREFIX, savedCountry.id),
        savedCountry,
        this.CACHE_TTL
      );

      // Invalidate the list cache
      await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));
    } catch (error) {
      // Log the error but don't fail the request
      console.error('Failed to cache country:', error);
    }

    return savedCountry;
  }

  async findAll(query: QueryCountriesDto): Promise<{ data: Countries[]; total: number }> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateListKey(`${this.CACHE_PREFIX}:${query.page}:${query.limit}`);
    const cachedResult = await this.cacheService.get<{ data: Countries[]; total: number }>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const [data, total] = await Promise.all([
      this.countriesRepository.find(query),
      this.countriesRepository.count(query)
    ]);

    const result = { data, total };

    // Cache the result
    await this.cacheService.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  async findById(id: number): Promise<Countries> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedCountry = await this.cacheService.get<Countries>(cacheKey);
    if (cachedCountry) {
      return cachedCountry;
    }

    const country = await this.countriesRepository.findById(id);
    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }

    // Cache the result
    await this.cacheService.set(cacheKey, country, this.CACHE_TTL);

    return country;
  }

  async update(id: number, updateCountriesDto: UpdateCountriesDto): Promise<Countries> {
    const country = await this.findById(id);
    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }

    await this.countriesRepository.update(id, updateCountriesDto);
    const updatedCountry = await this.findById(id);

    // Update cache
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    await this.cacheService.set(cacheKey, updatedCountry, this.CACHE_TTL);

    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

    return updatedCountry;
  }

  async remove(id: number): Promise<void> {
    const result = await this.countriesRepository.delete(id);
    if (!result) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }

    // Remove from cache
    await this.cacheService.del(this.cacheService.generateKey(this.CACHE_PREFIX, id));
    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));
  }
}

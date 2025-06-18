import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisCacheService } from '../../cache/redis-cache.service';
import { UpdateAttireAllowanceRatesDto } from '../dto/update-attire-allowance-rates.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { AttireAllowanceRatesRepository } from '../repositories/attire-allowance-rates.repository';
import { AttireAllowanceRates } from '../entities/attire-allowance-rates.entity';
import { AttireAllowanceRatesQueryDto } from '../dto/attire-allowance-rates-query.dto';
import { CreateAttireAllowanceRatesDto } from '../dto/create-attire-allowance-rates.dto';

@Injectable()
export class AttireAllowanceRatesService {
  private readonly CACHE_PREFIX = 'attire_allowance_rates';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    private readonly attireAllowanceRatesRepository: AttireAllowanceRatesRepository,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  private generateCacheKey(id: number): string {
    return this.redisCacheService.generateKey(this.CACHE_PREFIX, id);
  }

  private generateListCacheKey(): string {
    return this.redisCacheService.generateListKey(this.CACHE_PREFIX);
  }

  private async invalidateCache(id: number): Promise<void> {
    await this.redisCacheService.del(this.generateCacheKey(id));
  }

  private async invalidateListCache(): Promise<void> {
    await this.redisCacheService.del(this.generateListCacheKey());
  }

  async findAll(query: AttireAllowanceRatesQueryDto): Promise<PaginatedResult<AttireAllowanceRates>> {
    const { page = 1, limit = 10, orderBy = 'id', orderDir = 'asc', searchTerm, ...conditions } = query;

    // Generate cache key based on query parameters
    const cacheKey = this.generateListCacheKey();
    const cachedResult = await this.redisCacheService.get<PaginatedResult<AttireAllowanceRates>>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const where: any = {};

    // Add other conditions
    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'levelCodeStart' && key !== 'levelCodeEnd') {
        where[key] = value;
      }
    });

    const result = await this.attireAllowanceRatesRepository.findWithPaginationAndSearch(
      page,
      limit,
      where,
      orderBy,
      orderDir,
      searchTerm,
    );

    await this.redisCacheService.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  async findById(id: number): Promise<AttireAllowanceRates> {
    const cacheKey = this.generateCacheKey(id);
    const cachedRate = await this.redisCacheService.get<AttireAllowanceRates>(cacheKey);
    if (cachedRate) {
      return cachedRate;
    }

    const rate = await this.attireAllowanceRatesRepository.findById(id);
    if (!rate) {
      throw new NotFoundException(`Attire allowance rate with ID ${id} not found`);
    }

    await this.redisCacheService.set(cacheKey, rate, this.CACHE_TTL);
    return rate;
  }

  async findByAssignmentType(assignmentType: string): Promise<AttireAllowanceRates[]> {
    return this.attireAllowanceRatesRepository.findByAssignmentType(assignmentType);
  }

  async findByDestinationGroupCode(destinationGroupCode: string): Promise<AttireAllowanceRates[]> {
    return this.attireAllowanceRatesRepository.findByDestinationGroupCode(destinationGroupCode);
  }

  async create(createDto: CreateAttireAllowanceRatesDto): Promise<AttireAllowanceRates> {
    const result = await this.attireAllowanceRatesRepository.create(createDto);
    await this.invalidateListCache();
    return result;
  }

  async update(id: number, updateDto: UpdateAttireAllowanceRatesDto): Promise<AttireAllowanceRates> {
    const existing = await this.attireAllowanceRatesRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Attire allowance rate with ID ${id} not found`);
    }

    const result = await this.attireAllowanceRatesRepository.update(id, updateDto);
    await this.invalidateCache(id);
    await this.invalidateListCache();
    return result;
  }

  async remove(id: number): Promise<void> {
    const existing = await this.attireAllowanceRatesRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Attire allowance rate with ID ${id} not found`);
    }

    await this.attireAllowanceRatesRepository.delete(id);
    await this.invalidateCache(id);
    await this.invalidateListCache();
  }
} 
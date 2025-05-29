import { Injectable, NotFoundException } from '@nestjs/common';
import { ExpensesOtherRepository } from '../repositories/expenses-other.repository.js';
import { CreateExpensesOtherDto } from '../dto/create-expenses-other.dto.js';
import { UpdateExpensesOtherDto } from '../dto/update-expenses-other.dto.js';
import { ExpensesOther } from '../entities/expenses-other.entity.js';
import { RedisCacheService } from '../../cache/redis-cache.service.js';
import { ExpensesOtherQueryOptions } from '../interfaces/expenses-other-options.interface.js';
import { PaginatedResult } from '@common/interfaces/pagination.interface.js';

@Injectable()
export class ExpensesOtherService {
  private readonly CACHE_PREFIX = 'expenses_other';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly repository: ExpensesOtherRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async create(createExpensesOtherDto: CreateExpensesOtherDto): Promise<ExpensesOther> {
    const savedExpensesOther = await this.repository.create(createExpensesOtherDto);

    // Cache the new expenses-other
    await this.cacheService.set(
      this.cacheService.generateKey(this.CACHE_PREFIX, savedExpensesOther.id),
      savedExpensesOther,
      this.CACHE_TTL
    );

    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

    return savedExpensesOther;
  }

  async findAll(queryOptions?: ExpensesOtherQueryOptions): Promise<PaginatedResult<ExpensesOther>> {
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

    const cacheKey = this.cacheService.generateListKey(this.CACHE_PREFIX, cacheParams);
    const cachedResult = await this.cacheService.get<PaginatedResult<ExpensesOther>>(cacheKey);
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

    const result = await this.repository.findWithPaginationAndSearch(
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

  async findById(id: number): Promise<ExpensesOther> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedExpensesOther = await this.cacheService.get<ExpensesOther>(cacheKey);
    if (cachedExpensesOther) {
      return cachedExpensesOther;
    }

    const expensesOther = await this.repository.findById(id);
    if (!expensesOther) {
      throw new NotFoundException(`Expenses other with ID ${id} not found`);
    }

    // Cache the result
    await this.cacheService.set(cacheKey, expensesOther, this.CACHE_TTL);

    return expensesOther;
  }

  async update(id: number, updateExpensesOtherDto: UpdateExpensesOtherDto): Promise<ExpensesOther> {
    const expensesOther = await this.findById(id);
    if (!expensesOther) {
      throw new NotFoundException(`Expenses other with ID ${id} not found`);
    }

    await this.repository.update(id, updateExpensesOtherDto);
    const updatedExpensesOther = await this.findById(id);

    // Update cache
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    await this.cacheService.set(cacheKey, updatedExpensesOther, this.CACHE_TTL);

    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

    return updatedExpensesOther;
  }

  async remove(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (!result) {
      throw new NotFoundException(`Expenses other with ID ${id} not found`);
    }

    // Remove from cache
    await this.cacheService.del(this.cacheService.generateKey(this.CACHE_PREFIX, id));
    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));
  }
} 
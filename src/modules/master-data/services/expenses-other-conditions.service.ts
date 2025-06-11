import { Injectable, NotFoundException } from '@nestjs/common';
import { ExpensesOtherConditionsRepository } from '../repositories/expenses-other-conditions.repository';
import { CreateExpensesOtherConditionsDto } from '../dto/create-expenses-other-conditions.dto';
import { UpdateExpensesOtherConditionsDto } from '../dto/update-expenses-other-conditions.dto';
import { ExpensesOtherConditions } from '../entities/expenses-other-conditions.entity';
import { RedisCacheService } from '../../cache/redis-cache.service';
import { ExpensesOtherConditionsQueryDto } from '../dto/expenses-other-conditions-query.dto';
import { PaginatedResult } from '@common/interfaces/pagination.interface';

@Injectable()
export class ExpensesOtherConditionsService {
  private readonly CACHE_PREFIX = 'expenses_other_conditions';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly repository: ExpensesOtherConditionsRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async create(createExpensesOtherConditionsDto: CreateExpensesOtherConditionsDto): Promise<ExpensesOtherConditions> {
    const savedExpensesOtherConditions = await this.repository.create(createExpensesOtherConditionsDto);

    // Cache the new expenses-other-conditions
    await this.cacheService.set(
      this.cacheService.generateKey(this.CACHE_PREFIX, savedExpensesOtherConditions.id),
      savedExpensesOtherConditions,
      this.CACHE_TTL
    );

    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

    return savedExpensesOtherConditions;
  }

  async findAll(queryOptions?: ExpensesOtherConditionsQueryDto): Promise<PaginatedResult<ExpensesOtherConditions>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      orderDir = 'DESC',
      positionName,
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
      positionName ? `positionName:${positionName}` : null,
      searchTerm ? `search:${searchTerm}` : null,
      createdAfter ? `createdAfter:${createdAfter.toISOString()}` : null,
      createdBefore ? `createdBefore:${createdBefore.toISOString()}` : null,
      updatedAfter ? `updatedAfter:${updatedAfter.toISOString()}` : null,
      updatedBefore ? `updatedBefore:${updatedBefore.toISOString()}` : null,
    ].filter(Boolean).join(':');

    const cacheKey = this.cacheService.generateListKey(this.CACHE_PREFIX, cacheParams);
    const cachedResult = await this.cacheService.get<PaginatedResult<ExpensesOtherConditions>>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Prepare conditions
    const conditions: Record<string, any> = {};
    
    if (positionName) {
      conditions.position_name = positionName;
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

  async findById(id: number): Promise<ExpensesOtherConditions> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedExpensesOtherConditions = await this.cacheService.get<ExpensesOtherConditions>(cacheKey);
    if (cachedExpensesOtherConditions) {
      return cachedExpensesOtherConditions;
    }

    const expensesOtherConditions = await this.repository.findById(id);
    if (!expensesOtherConditions) {
      throw new NotFoundException(`Expenses other conditions with ID ${id} not found`);
    }

    // Cache the result
    await this.cacheService.set(cacheKey, expensesOtherConditions, this.CACHE_TTL);

    return expensesOtherConditions;
  }

  async update(id: number, updateExpensesOtherConditionsDto: UpdateExpensesOtherConditionsDto): Promise<ExpensesOtherConditions> {
    const expensesOtherConditions = await this.findById(id);
    if (!expensesOtherConditions) {
      throw new NotFoundException(`Expenses other conditions with ID ${id} not found`);
    }

    await this.repository.update(id, updateExpensesOtherConditionsDto);
    const updatedExpensesOtherConditions = await this.findById(id);

    // Update cache
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    await this.cacheService.set(cacheKey, updatedExpensesOtherConditions, this.CACHE_TTL);

    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

    return updatedExpensesOtherConditions;
  }

  async remove(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (!result) {
      throw new NotFoundException(`Expenses other conditions with ID ${id} not found`);
    }

    // Remove from cache
    await this.cacheService.del(this.cacheService.generateKey(this.CACHE_PREFIX, id));
    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));
  }
} 
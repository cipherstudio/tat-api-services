import { Injectable, NotFoundException } from '@nestjs/common';
import { ExpensesVehicle } from '../entities/expenses-vehicle.entity';
import { IExpensesVehicleService } from '../interfaces/expenses-vehicle.interface';
import { ExpensesVehicleRepository } from '../repositories/expenses-vehicle.repository';
import { ExpensesVehicleQueryDto } from '../dto/expenses-vehicle-query.dto';
import { PaginatedResult } from '@common/interfaces/pagination.interface';
import { RedisCacheService } from '../../cache/redis-cache.service';

@Injectable()
export class ExpensesVehicleService implements IExpensesVehicleService {
  private readonly CACHE_PREFIX = 'expenses_vehicle';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly repository: ExpensesVehicleRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async findAll(queryOptions?: ExpensesVehicleQueryDto): Promise<PaginatedResult<ExpensesVehicle>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      orderDir = 'DESC',
      code,
      title,
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
      code ? `code:${code}` : null,
      title ? `title:${title}` : null,
      searchTerm ? `search:${searchTerm}` : null,
      createdAfter ? `createdAfter:${createdAfter.toISOString()}` : null,
      createdBefore ? `createdBefore:${createdBefore.toISOString()}` : null,
      updatedAfter ? `updatedAfter:${updatedAfter.toISOString()}` : null,
      updatedBefore ? `updatedBefore:${updatedBefore.toISOString()}` : null,
    ].filter(Boolean).join(':');

    const cacheKey = this.cacheService.generateListKey(this.CACHE_PREFIX, cacheParams);
    const cachedResult = await this.cacheService.get<PaginatedResult<ExpensesVehicle>>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Prepare conditions
    const conditions: Record<string, any> = {};
    
    if (code) {
      conditions.code = code;
    }

    if (title) {
      conditions.title = title;
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

  async update(id: number, data: Partial<ExpensesVehicle>): Promise<ExpensesVehicle> {
    const exists = await this.repository.findById(id);
    if (!exists) {
      throw new NotFoundException(`Expenses vehicle with ID ${id} not found`);
    }

    const updated = await this.repository.update(id, data);

    // Update cache
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    await this.cacheService.set(cacheKey, updated, this.CACHE_TTL);

    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

    return updated;
  }
} 
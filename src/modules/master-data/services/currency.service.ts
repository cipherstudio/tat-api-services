import { Injectable, NotFoundException } from '@nestjs/common';
import { Currency } from '../entities/currency.entity';
import { CreateCurrencyDto } from '../dto/create-currency.dto';
import { UpdateCurrencyDto } from '../dto/update-currency.dto';
import { CurrencyQueryOptions } from '../interfaces/currency-options.interface';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { RedisCacheService } from '../../cache/redis-cache.service';
import { CurrencyRepository } from '../repositories/currency.repository';

@Injectable()
export class CurrencyService {
  private readonly CACHE_PREFIX = 'currencies';
  private readonly CACHE_TTL = 3600;

  constructor(
    private readonly currencyRepository: CurrencyRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async create(createCurrencyDto: CreateCurrencyDto): Promise<Currency> {
    const saved = await this.currencyRepository.create(createCurrencyDto);
    await this.cacheService.set(
      this.cacheService.generateKey(this.CACHE_PREFIX, saved.id),
      saved,
      this.CACHE_TTL,
    );
    await this.cacheService.del(
      this.cacheService.generateListKey(this.CACHE_PREFIX),
    );
    return saved;
  }

  async findAll(
    queryOptions?: CurrencyQueryOptions,
  ): Promise<PaginatedResult<Currency>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'id',
      orderDir = 'DESC',
      currencyTh,
      currencyCodeTh,
      currencyEn,
      currencyCodeEn,
      searchTerm,
    } = queryOptions || {};

    const cacheParams = [
      `page:${page}`,
      `limit:${limit}`,
      `orderBy:${orderBy}`,
      `orderDir:${orderDir}`,
      currencyTh ? `currencyTh:${currencyTh}` : null,
      currencyCodeTh ? `currencyCodeTh:${currencyCodeTh}` : null,
      currencyEn ? `currencyEn:${currencyEn}` : null,
      currencyCodeEn ? `currencyCodeEn:${currencyCodeEn}` : null,
      searchTerm ? `search:${searchTerm}` : null,
    ]
      .filter(Boolean)
      .join(':');

    const cacheKey = this.cacheService.generateListKey(
      this.CACHE_PREFIX,
      cacheParams,
    );
    const cachedResult =
      await this.cacheService.get<PaginatedResult<Currency>>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const conditions: Record<string, any> = {};
    if (currencyTh) conditions.currency_th = currencyTh;
    if (currencyCodeTh) conditions.currency_code_th = currencyCodeTh;
    if (currencyEn) conditions.currency_en = currencyEn;
    if (currencyCodeEn) conditions.currency_code_en = currencyCodeEn;

    const result = await this.currencyRepository.findWithPaginationAndSearch(
      page,
      limit,
      conditions,
      orderBy,
      orderDir.toLowerCase() as 'asc' | 'desc',
      searchTerm,
    );
    await this.cacheService.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  async findById(id: number): Promise<Currency> {
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    const cached = await this.cacheService.get<Currency>(cacheKey);
    if (cached) return cached;
    const currency = await this.currencyRepository.findById(id);
    if (!currency)
      throw new NotFoundException(`Currency with ID ${id} not found`);
    await this.cacheService.set(cacheKey, currency, this.CACHE_TTL);
    return currency;
  }

  async update(
    id: number,
    updateCurrencyDto: UpdateCurrencyDto,
  ): Promise<Currency> {
    const currency = await this.findById(id);
    if (!currency)
      throw new NotFoundException(`Currency with ID ${id} not found`);
    await this.currencyRepository.update(id, updateCurrencyDto);
    const updated = await this.findById(id);
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    await this.cacheService.set(cacheKey, updated, this.CACHE_TTL);
    await this.cacheService.del(
      this.cacheService.generateListKey(this.CACHE_PREFIX),
    );
    return updated;
  }

  async remove(id: number): Promise<void> {
    const result = await this.currencyRepository.delete(id);
    if (!result)
      throw new NotFoundException(`Currency with ID ${id} not found`);
    await this.cacheService.del(
      this.cacheService.generateKey(this.CACHE_PREFIX, id),
    );
    await this.cacheService.del(
      this.cacheService.generateListKey(this.CACHE_PREFIX),
    );
  }
}

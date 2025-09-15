import { Injectable } from '@nestjs/common';
import { ReportSettingsRepository } from '../repositories/report-settings.repository';
import { RedisCacheService } from '../../cache/redis-cache.service';
import { CreateReportSettingsDto } from '../dto/create-report-settings.dto';
import { UpdateReportSettingsDto } from '../dto/update-report-settings.dto';
import { ReportSettingsQueryDto } from '../dto/report-settings-query.dto';
import { ReportSettings } from '../entities/report-settings.entity';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';

@Injectable()
export class ReportSettingsService {
  private readonly CACHE_PREFIX = 'report_settings';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    private readonly reportSettingsRepository: ReportSettingsRepository,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async findAll(query: ReportSettingsQueryDto): Promise<PaginatedResult<ReportSettings>> {
    const cacheKey = this.redisCacheService.generateListKey(this.CACHE_PREFIX, JSON.stringify(query));
    const cachedResult = await this.redisCacheService.get<PaginatedResult<ReportSettings>>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const result = await this.reportSettingsRepository.findWithPaginationAndSearch(
      query.page,
      query.limit,
      {
        reportName: query.reportName,
        code: query.code,
      },
      query.orderBy,
      query.orderDir?.toLowerCase() as 'asc' | 'desc',
      query.searchTerm,
    );

    await this.redisCacheService.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  async findById(id: number): Promise<ReportSettings> {
    const cacheKey = this.redisCacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedResult = await this.redisCacheService.get<ReportSettings>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const result = await this.reportSettingsRepository.findById(id);
    if (result) {
      await this.redisCacheService.set(cacheKey, result, this.CACHE_TTL);
    }
    return result;
  }

  async create(createReportSettingsDto: CreateReportSettingsDto): Promise<ReportSettings> {
    const result = await this.reportSettingsRepository.create(createReportSettingsDto);
    await this.invalidateListCache();
    return result;
  }

  async update(id: number, updateReportSettingsDto: UpdateReportSettingsDto): Promise<ReportSettings> {
    const existing = await this.reportSettingsRepository.findById(id);
    if (!existing) {
      throw new Error('Report settings not found');
    }

    const result = await this.reportSettingsRepository.update(id, updateReportSettingsDto);
    await this.invalidateCache(id);
    await this.invalidateListCache();
    return result;
  }

  async remove(id: number): Promise<void> {
    const existing = await this.reportSettingsRepository.findById(id);
    if (!existing) {
      throw new Error('Report settings not found');
    }

    await this.reportSettingsRepository.delete(id);
    await this.invalidateCache(id);
    await this.invalidateListCache();
  }

  private async invalidateCache(id: number): Promise<void> {
    const cacheKey = this.redisCacheService.generateKey(this.CACHE_PREFIX, id);
    await this.redisCacheService.del(cacheKey);
  }

  private async invalidateListCache(): Promise<void> {
    const cacheKey = this.redisCacheService.generateListKey(this.CACHE_PREFIX);
    await this.redisCacheService.del(cacheKey);
  }
}

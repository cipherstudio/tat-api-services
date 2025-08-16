import { Injectable } from '@nestjs/common';
import { MeetRateRepository } from '../repositories/meet-rate.repository';
import { RedisCacheService } from '../../cache/redis-cache.service';
import { CreateMeetRateDto } from '../dto/create-meet-rate.dto';
import { UpdateMeetRateDto } from '../dto/update-meet-rate.dto';
import { MeetRateQueryDto } from '../dto/meet-rate-query.dto';
import { MeetRate } from '../entities/meet-rate.entity';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';

@Injectable()
export class MeetRateService {
  private readonly CACHE_PREFIX = 'meet_rate';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    private readonly meetRateRepository: MeetRateRepository,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async findAll(query: MeetRateQueryDto): Promise<PaginatedResult<MeetRate>> {
    const cacheKey = this.redisCacheService.generateListKey(this.CACHE_PREFIX, JSON.stringify(query));
    const cachedResult = await this.redisCacheService.get<PaginatedResult<MeetRate>>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const result = await this.meetRateRepository.findWithPaginationAndSearch(
      query.page,
      query.limit,
      {
        type: query.type,
      },
      query.orderBy,
      query.orderDir?.toLowerCase() as 'asc' | 'desc',
      query.searchTerm,
    );

    await this.redisCacheService.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  async findById(id: number): Promise<MeetRate> {
    const cacheKey = this.redisCacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedResult = await this.redisCacheService.get<MeetRate>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const result = await this.meetRateRepository.findById(id);
    if (result) {
      await this.redisCacheService.set(cacheKey, result, this.CACHE_TTL);
    }
    return result;
  }

  async create(createMeetRateDto: CreateMeetRateDto): Promise<MeetRate> {
    const result = await this.meetRateRepository.create(createMeetRateDto);
    await this.invalidateListCache();
    return result;
  }

  async update(id: number, updateMeetRateDto: UpdateMeetRateDto): Promise<MeetRate> {
    const existing = await this.meetRateRepository.findById(id);
    if (!existing) {
      throw new Error('Meet rate not found');
    }

    const result = await this.meetRateRepository.update(id, updateMeetRateDto);
    await this.invalidateCache(id);
    await this.invalidateListCache();
    return result;
  }

  async remove(id: number): Promise<void> {
    const existing = await this.meetRateRepository.findById(id);
    if (!existing) {
      throw new Error('Meet rate not found');
    }

    await this.meetRateRepository.delete(id);
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

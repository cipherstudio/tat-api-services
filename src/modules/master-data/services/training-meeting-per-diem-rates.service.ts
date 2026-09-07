import { Injectable, NotFoundException } from '@nestjs/common';
import { TrainingMeetingPerDiemRatesRepository } from '../repositories/training-meeting-per-diem-rates.repository';
import { TrainingMeetingPerDiemRates } from '../entities/training-meeting-per-diem-rates.entity';
import { CreateTrainingMeetingPerDiemRatesDto } from '../dto/create-training-meeting-per-diem-rates.dto';
import { UpdateTrainingMeetingPerDiemRatesDto } from '../dto/update-training-meeting-per-diem-rates.dto';
import { RedisCacheService } from '../../cache/redis-cache.service';
import { PaginatedResult } from '@common/interfaces/pagination.interface';

@Injectable()
export class TrainingMeetingPerDiemRatesService {
  private readonly CACHE_PREFIX = 'training_meeting_per_diem_rates';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly trainingMeetingPerDiemRatesRepository: TrainingMeetingPerDiemRatesRepository,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async findAll(
    queryOptions?: any,
  ): Promise<PaginatedResult<TrainingMeetingPerDiemRates>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      orderDir = 'DESC',
      rateType,
      positionGroup,
      positionName,
      areaType,
      searchTerm,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      levelCodeStart,
      levelCodeEnd,
    } = queryOptions || {};

    const cacheParams = [
      `page:${page}`,
      `limit:${limit}`,
      `orderBy:${orderBy}`,
      `orderDir:${orderDir}`,
      rateType ? `rateType:${rateType}` : null,
      positionGroup ? `positionGroup:${positionGroup}` : null,
      positionName ? `positionName:${positionName}` : null,
      areaType ? `areaType:${areaType}` : null,
      searchTerm ? `search:${searchTerm}` : null,
      createdAfter ? `createdAfter:${createdAfter.toISOString()}` : null,
      createdBefore ? `createdBefore:${createdBefore.toISOString()}` : null,
      updatedAfter ? `updatedAfter:${updatedAfter.toISOString()}` : null,
      updatedBefore ? `updatedBefore:${updatedBefore.toISOString()}` : null,
      levelCodeStart ? `levelCodeStart:${levelCodeStart}` : null,
      levelCodeEnd ? `levelCodeEnd:${levelCodeEnd}` : null,
    ]
      .filter(Boolean)
      .join(':');

    const cacheKey = this.redisCacheService.generateListKey(
      this.CACHE_PREFIX,
      cacheParams,
    );
    const cachedResult = await this.redisCacheService.get<
      PaginatedResult<TrainingMeetingPerDiemRates>
    >(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const conditions: Record<string, any> = {};

    if (rateType) {
      conditions.rate_type = rateType;
    }

    if (positionGroup) {
      conditions.position_group = positionGroup;
    }

    if (positionName) {
      conditions.position_name = positionName;
    }

    if (areaType) {
      conditions.area_type = areaType;
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

    if (levelCodeStart) {
      conditions.level_code_start = {
        ...conditions.level_code_start,
        $eq: levelCodeStart,
      };
    }

    if (levelCodeEnd) {
      conditions.level_code_end = {
        ...conditions.level_code_end,
        $eq: levelCodeEnd,
      };
    }

    const result =
      await this.trainingMeetingPerDiemRatesRepository.findWithPaginationAndSearch(
        page,
        limit,
        conditions,
        orderBy,
        orderDir.toLowerCase() as 'asc' | 'desc',
        searchTerm,
      );

    await this.redisCacheService.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  async findById(id: number): Promise<TrainingMeetingPerDiemRates> {
    const cacheKey = this.redisCacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedRate =
      await this.redisCacheService.get<TrainingMeetingPerDiemRates>(cacheKey);
    if (cachedRate) {
      return cachedRate;
    }

    const rate = await this.trainingMeetingPerDiemRatesRepository.findById(id);
    if (!rate) {
      throw new NotFoundException(
        `Training/meeting per diem rate with ID ${id} not found`,
      );
    }

    await this.redisCacheService.set(cacheKey, rate, this.CACHE_TTL);

    return rate;
  }

  async create(
    createDto: CreateTrainingMeetingPerDiemRatesDto,
  ): Promise<TrainingMeetingPerDiemRates> {
    const savedRate =
      await this.trainingMeetingPerDiemRatesRepository.create(createDto);

    await this.redisCacheService.set(
      this.redisCacheService.generateKey(this.CACHE_PREFIX, savedRate.id),
      savedRate,
      this.CACHE_TTL,
    );

    await this.redisCacheService.del(
      this.redisCacheService.generateListKey(this.CACHE_PREFIX),
    );

    return savedRate;
  }

  async update(
    id: number,
    updateDto: UpdateTrainingMeetingPerDiemRatesDto,
  ): Promise<TrainingMeetingPerDiemRates> {
    const rate = await this.findById(id);
    if (!rate) {
      throw new NotFoundException(
        `Training/meeting per diem rate with ID ${id} not found`,
      );
    }

    await this.trainingMeetingPerDiemRatesRepository.update(id, updateDto);
    const updatedRate = await this.findById(id);

    const cacheKey = this.redisCacheService.generateKey(this.CACHE_PREFIX, id);
    await this.redisCacheService.set(cacheKey, updatedRate, this.CACHE_TTL);

    await this.redisCacheService.del(
      this.redisCacheService.generateListKey(this.CACHE_PREFIX),
    );

    return updatedRate;
  }

  async remove(id: number): Promise<void> {
    const result = await this.trainingMeetingPerDiemRatesRepository.delete(id);
    if (!result) {
      throw new NotFoundException(
        `Training/meeting per diem rate with ID ${id} not found`,
      );
    }

    await this.redisCacheService.del(
      this.redisCacheService.generateKey(this.CACHE_PREFIX, id),
    );
    await this.redisCacheService.del(
      this.redisCacheService.generateListKey(this.CACHE_PREFIX),
    );
  }

  async findByLevelCode(
    levelCode?: string,
    rateType?: 'TRAINING' | 'MEETING',
  ): Promise<TrainingMeetingPerDiemRates[]> {
    return this.trainingMeetingPerDiemRatesRepository.findByLevelCode(
      levelCode,
      rateType,
    );
  }
}

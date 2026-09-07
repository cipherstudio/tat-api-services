import { Injectable } from '@nestjs/common';
import { TrainingMeetingPerDiemRates } from '../entities/training-meeting-per-diem-rates.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class TrainingMeetingPerDiemRatesRepository extends KnexBaseRepository<TrainingMeetingPerDiemRates> {
  constructor(knexService: KnexService) {
    super(knexService, 'training_meeting_per_diem_rates');
  }

  async create(
    entity: Partial<TrainingMeetingPerDiemRates>,
  ): Promise<TrainingMeetingPerDiemRates> {
    const dbEntity = await toSnakeCase(entity);
    const created = await super.create(dbEntity);
    return await toCamelCase<TrainingMeetingPerDiemRates>(created);
  }

  async update(
    id: number,
    entity: Partial<TrainingMeetingPerDiemRates>,
  ): Promise<TrainingMeetingPerDiemRates> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await super.update(id, dbEntity);
    return await toCamelCase<TrainingMeetingPerDiemRates>(updated);
  }

  async findById(
    id: number,
  ): Promise<TrainingMeetingPerDiemRates | undefined> {
    const dbEntity = await super.findById(id);
    return dbEntity
      ? await toCamelCase<TrainingMeetingPerDiemRates>(dbEntity)
      : undefined;
  }

  async findOne(
    conditions: Record<string, any>,
  ): Promise<TrainingMeetingPerDiemRates | undefined> {
    const dbEntity = await super.findOne(conditions);
    return dbEntity
      ? await toCamelCase<TrainingMeetingPerDiemRates>(dbEntity)
      : undefined;
  }

  async find(
    conditions: Record<string, any> = {},
  ): Promise<TrainingMeetingPerDiemRates[]> {
    const dbEntities = await super.find(conditions);
    return Promise.all(
      dbEntities.map(
        async (e) => await toCamelCase<TrainingMeetingPerDiemRates>(e),
      ),
    );
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    const result = await super.findWithPagination(
      page,
      limit,
      conditions,
      orderBy,
      direction,
    );
    return {
      ...result,
      data: await Promise.all(
        result.data.map(
          async (e) => await toCamelCase<TrainingMeetingPerDiemRates>(e),
        ),
      ),
    };
  }

  async findWithPaginationAndSearch(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
    searchTerm?: string,
  ) {
    const query = this.knex(this.tableName);

    // Apply base conditions
    if (Object.keys(conditions).length > 0) {
      query.where(conditions);
    }

    // Apply search term if provided
    if (searchTerm) {
      query.where((builder) => {
        builder
          .whereRaw('LOWER("position_group") LIKE ?', [
            `%${searchTerm.toLowerCase()}%`,
          ])
          .orWhereRaw('LOWER("position_name") LIKE ?', [
            `%${searchTerm.toLowerCase()}%`,
          ]);
      });
    }

    const offset = (page - 1) * limit;

    // Get total count with search conditions
    const countResult = await query.clone().count('* as count').first();
    const total = Number(countResult?.count || 0);

    // Convert orderBy to snake_case for database
    const dbOrderBy = await toSnakeCase({ [orderBy]: null });
    const dbOrderByKey = Object.keys(dbOrderBy)[0];

    // Get paginated data
    const data = await query
      .orderBy(dbOrderByKey, direction)
      .limit(limit)
      .offset(offset);

    return {
      data: await Promise.all(
        data.map(async (e) => await toCamelCase<TrainingMeetingPerDiemRates>(e)),
      ),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  /**
   * ช่วงระดับใช้เกณฑ์เดียวกับ per_diem_rates — 01–08 กลุ่มหนึ่ง, 09–11 อีกกลุ่มหนึ่ง
   * ให้ผลลัพธ์ตรงกับที่ getPerDiemRateForStaff ฝั่งหน้าบ้านคาดหวัง
   */
  async findByLevelCode(
    levelCode?: string,
    rateType?: 'TRAINING' | 'MEETING',
  ): Promise<TrainingMeetingPerDiemRates[]> {
    let codeStart = null;
    let codeEnd = null;

    if (levelCode === '09' || levelCode === '10' || levelCode === '11') {
      codeStart = '09';
      codeEnd = '11';
    }

    if (
      levelCode === '01' ||
      levelCode === '02' ||
      levelCode === '03' ||
      levelCode === '04' ||
      levelCode === '05' ||
      levelCode === '06' ||
      levelCode === '07' ||
      levelCode === '08'
    ) {
      codeStart = '01';
      codeEnd = '08';
    }

    const conditions: Record<string, any> = {
      level_code_start: codeStart,
      level_code_end: codeEnd,
    };

    if (rateType) {
      conditions.rate_type = rateType;
    }

    const result = await this.knex(this.tableName)
      .where(conditions)
      .orderBy('id', 'asc');
    return await Promise.all(
      result.map(async (e) => await toCamelCase<TrainingMeetingPerDiemRates>(e)),
    );
  }
}

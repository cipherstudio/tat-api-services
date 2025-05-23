import { Injectable } from '@nestjs/common';
import { AbHoliday, AbHolidayPaginate } from '../entities/ab-holiday.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';
import { QueryAbHolidayDto } from '../dto/query-ab-holiday.dto';

@Injectable()
export class AbHolidayRepository extends KnexBaseRepository<AbHoliday> {
  constructor(knexService: KnexService) {
    super(knexService, 'AB_HOLIDAY');
  }

  async findWithQuery(query: QueryAbHolidayDto): Promise<AbHolidayPaginate> {
    const conditions: Record<string, any> = {};
    if (query.holidayDate) conditions['HOLIDAY_DATE'] = query.holidayDate;
    if (query.pogCode) conditions['POG_CODE'] = query.pogCode;

    let builder = this.knex(this.tableName).where(conditions);
    if (query.limit !== undefined) builder = builder.limit(query.limit);
    if (query.offset !== undefined) builder = builder.offset(query.offset);

    // นับจำนวนทั้งหมด (ไม่ใส่ limit/offset)
    const countQuery = this.knex(this.tableName).where(conditions);
    const countResult = await countQuery.count('* as count').first();
    const total = Number(countResult?.count || 0);

    const dbEntities = await builder.select();
    const data = await Promise.all(
      dbEntities.map(async (e) => await toCamelCase<AbHoliday>(e)),
    );
    return {
      data,
      meta: {
        total,
        limit: query.limit ?? 10,
        offset: query.offset ?? 0,
      },
    };
  }

  async findCurrentYear(): Promise<AbHoliday[]> {
    const currentYear = new Date().getFullYear();
    const start = new Date(currentYear, 0, 1);
    const end = new Date(currentYear + 1, 0, 1);
    const dbEntities = await this.knex(this.tableName)
      .where('HOLIDAY_DATE', '>=', start)
      .andWhere('HOLIDAY_DATE', '<', end)
      .select();
    return Promise.all(
      dbEntities.map(async (e) => await toCamelCase<AbHoliday>(e)),
    );
  }
}

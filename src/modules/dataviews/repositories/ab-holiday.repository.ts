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
    if (query.pogCode) conditions['POG_CODE'] = query.pogCode;

    let builder = this.knex(this.tableName).where(conditions);

    // Handle simple date range (startDate + endDate)
    if (query.startDate && query.endDate) {
      const startDate = new Date(query.startDate);
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      builder = builder.whereBetween('HOLIDAY_DATE', [startDate, endDate]);
    }
    // Handle multiple date ranges
    else if (query.dateRanges && query.dateRanges.length > 0) {
      // Additional parsing fallback in case DTO transform didn't work
      let dateRanges = query.dateRanges;
      if (typeof query.dateRanges === 'string') {
        try {
          dateRanges = JSON.parse(query.dateRanges as any);
        } catch (error) {
          console.error('Failed to parse dateRanges:', error);
          dateRanges = [];
        }
      }

      if (Array.isArray(dateRanges) && dateRanges.length > 0) {
        builder = builder.where((dateBuilder) => {
          dateRanges.forEach((range, index) => {
            if (range.startDate && range.endDate) {
              const startDate = new Date(range.startDate);
              const endDate = new Date(range.endDate);
              // Set end date to end of day
              endDate.setHours(23, 59, 59, 999);

              if (index === 0) {
                dateBuilder.whereBetween('HOLIDAY_DATE', [startDate, endDate]);
              } else {
                dateBuilder.orWhereBetween('HOLIDAY_DATE', [
                  startDate,
                  endDate,
                ]);
              }
            }
          });
        });
      }
    }
    // Handle single date (backward compatibility)
    else if (query.holidayDate) {
      const date = new Date(query.holidayDate);
      builder = builder.whereRaw('DATE(HOLIDAY_DATE) = DATE(?)', [date]);
    }

    if (query.limit !== undefined) builder = builder.limit(query.limit);
    if (query.offset !== undefined) builder = builder.offset(query.offset);

    // Count total
    const countQuery = this.knex(this.tableName).where(conditions);

    // Apply same date filtering to count query
    if (query.startDate && query.endDate) {
      const startDate = new Date(query.startDate);
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      countQuery.whereBetween('HOLIDAY_DATE', [startDate, endDate]);
    } else if (query.dateRanges && query.dateRanges.length > 0) {
      // Additional parsing fallback for count query
      let dateRanges = query.dateRanges;
      if (typeof query.dateRanges === 'string') {
        try {
          dateRanges = JSON.parse(query.dateRanges as any);
        } catch (error) {
          dateRanges = [];
        }
      }

      if (Array.isArray(dateRanges) && dateRanges.length > 0) {
        countQuery.where((dateBuilder) => {
          dateRanges.forEach((range, index) => {
            if (range.startDate && range.endDate) {
              const startDate = new Date(range.startDate);
              const endDate = new Date(range.endDate);
              endDate.setHours(23, 59, 59, 999);

              if (index === 0) {
                dateBuilder.whereBetween('HOLIDAY_DATE', [startDate, endDate]);
              } else {
                dateBuilder.orWhereBetween('HOLIDAY_DATE', [
                  startDate,
                  endDate,
                ]);
              }
            }
          });
        });
      }
    } else if (query.holidayDate) {
      const date = new Date(query.holidayDate);
      countQuery.whereRaw('DATE(HOLIDAY_DATE) = DATE(?)', [date]);
    }

    const countResult = await countQuery.count('* as count').first();
    const total = Number(countResult?.count || 0);

    const dbEntities = await builder.select().orderBy('HOLIDAY_DATE', 'asc');
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
      .select()
      .orderBy('HOLIDAY_DATE', 'asc');
    return Promise.all(
      dbEntities.map(async (e) => await toCamelCase<AbHoliday>(e)),
    );
  }
}

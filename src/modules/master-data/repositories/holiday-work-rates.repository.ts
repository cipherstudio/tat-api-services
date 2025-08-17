import { Injectable } from '@nestjs/common';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toSnakeCase } from '../../../common/utils/case-mapping';
import { HolidayWorkRate } from '../entities/holiday-work-rates.entity';

@Injectable()
export class HolidayWorkRatesRepository extends KnexBaseRepository<HolidayWorkRate> {
  constructor(knexService: KnexService) {
    super(knexService, 'holiday_work_rates');
  }

  async findWithPaginationAndSearch(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'step_level',
    direction: 'asc' | 'desc' = 'desc',
  ) {
    const filter = { ...conditions };

    const dbFilter = await toSnakeCase(filter);
    const offset = (page - 1) * limit;

    // 1. Query for total count
    const baseQuery = this.knex('holiday_work_rates');
    if (Object.keys(dbFilter).length > 0) baseQuery.where(dbFilter);
    const countResult = await baseQuery.clone().count('* as count').first();
    const total = Number(countResult?.count || 0);

    // 2. Query for ids with pagination
    const idRows = await baseQuery
      .clone()
      .orderBy(orderBy, direction)
      .limit(limit)
      .offset(offset)
      .pluck('id');

    if (idRows.length === 0) {
      return {
        data: [],
        meta: { total, page, limit, lastPage: Math.ceil(total / limit) },
      };
    }

    // 3. Join hours for paginated ids
    const rows = await this.knex('holiday_work_rates')
      .leftJoin(
        'holiday_work_hours',
        'holiday_work_rates.id',
        'holiday_work_hours.rate_id',
      )
      .select(
        'holiday_work_rates.*',
        'holiday_work_hours.id as hour_id',
        'holiday_work_hours.hour',
        'holiday_work_hours.work_pay',
        'holiday_work_hours.tax_rate',
        'holiday_work_hours.created_at as hour_created_at',
        'holiday_work_hours.updated_at as hour_updated_at',
      )
      .whereIn('holiday_work_rates.id', idRows)
      .orderBy('holiday_work_rates.' + orderBy, direction);

    // Group hours by rate
    const ratesMap = new Map();
    for (const row of rows) {
      const rateId = row.id;
      if (!ratesMap.has(rateId)) {
        ratesMap.set(rateId, {
          id: row.id,
          stepLevel: row.step_level,
          salary: row.salary,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          hours: [],
        });
      }
      if (row.hour_id) {
        ratesMap.get(rateId).hours.push({
          id: row.hour_id,
          hour: row.hour,
          workPay: row.work_pay,
          taxRate: row.tax_rate,
          createdAt: row.hour_created_at,
          updatedAt: row.hour_updated_at,
        });
      }
    }
    // Sort hours array by hour ascending
    for (const rate of ratesMap.values()) {
      rate.hours.sort((a, b) => a.hour - b.hour);
    }
    const data = Array.from(ratesMap.values());
    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findWithHours(query: Record<string, any> = {}): Promise<any[]> {
    // แยก filter กับ control
    const { step_level, salary, sort, page, limit } = query;
    const filter: any = {};
    if (step_level !== undefined) filter.step_level = step_level;
    if (salary !== undefined) filter.salary = salary;
    const dbFilter = await toSnakeCase(filter);

    let knexQuery = this.knex('holiday_work_rates')
      .leftJoin(
        'holiday_work_hours',
        'holiday_work_rates.id',
        'holiday_work_hours.rate_id',
      )
      .select(
        'holiday_work_rates.*',
        'holiday_work_hours.id as hour_id',
        'holiday_work_hours.hour',
        'holiday_work_hours.work_pay',
        'holiday_work_hours.tax_rate',
        'holiday_work_hours.created_at as hour_created_at',
        'holiday_work_hours.updated_at as hour_updated_at',
      );

    if (Object.keys(dbFilter).length > 0) {
      knexQuery = knexQuery.where(dbFilter);
    }
    if (sort) {
      knexQuery = knexQuery.orderBy(sort, 'asc');
    } else {
      knexQuery = knexQuery.orderBy('step_level', 'asc');
    }
    if (page && limit) {
      knexQuery = knexQuery
        .limit(Number(limit))
        .offset((Number(page) - 1) * Number(limit));
    }

    const rows = await knexQuery;

    // Group hours by rate
    const ratesMap = new Map();
    for (const row of rows) {
      const rateId = row.id;
      if (!ratesMap.has(rateId)) {
        ratesMap.set(rateId, {
          id: row.id,
          stepLevel: row.step_level,
          salary: row.salary,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          hours: [],
        });
      }
      if (row.hour_id) {
        ratesMap.get(rateId).hours.push({
          id: row.hour_id,
          hour: row.hour,
          workPay: row.work_pay,
          taxRate: row.tax_rate,
          createdAt: row.hour_created_at,
          updatedAt: row.hour_updated_at,
        });
      }
    }
    // Sort hours array by hour ascending
    for (const rate of ratesMap.values()) {
      rate.hours.sort((a, b) => a.hour - b.hour);
    }
    return Array.from(ratesMap.values());
  }

  async findWithSalary(salary: number): Promise<any[]> {
    const rows = await this.knex('holiday_work_rates')
      .where('salary', salary)
      .orderBy('step_level', 'asc');
    return rows;
  }
}

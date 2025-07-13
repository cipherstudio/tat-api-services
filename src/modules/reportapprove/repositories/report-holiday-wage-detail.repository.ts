import { Injectable } from '@nestjs/common';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { ReportHolidayWageDetail } from '../entities/report-holiday-wage-detail.entity';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class ReportHolidayWageDetailRepository extends KnexBaseRepository<ReportHolidayWageDetail> {
  constructor(knexService: KnexService) {
    super(knexService, 'report_holiday_wage_detail');
  }

  async create(
    entity: Partial<ReportHolidayWageDetail>,
  ): Promise<ReportHolidayWageDetail> {
    const dbEntity = await toSnakeCase(entity);
    const [created] = await this.knex('report_holiday_wage_detail')
      .insert(dbEntity)
      .returning('*');
    return await toCamelCase<ReportHolidayWageDetail>(created);
  }

  async update(
    id: number,
    entity: Partial<ReportHolidayWageDetail>,
  ): Promise<ReportHolidayWageDetail> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await this.knex('report_holiday_wage_detail')
      .where({ holiday_id: id })
      .update(dbEntity);
    return await toCamelCase<ReportHolidayWageDetail>(updated);
  }

  async findById(id: number): Promise<ReportHolidayWageDetail | undefined> {
    const dbEntity = await this.knex('report_holiday_wage_detail')
      .where({ holiday_id: id })
      .first();
    return dbEntity
      ? await toCamelCase<ReportHolidayWageDetail>(dbEntity)
      : undefined;
  }

  async findOne(
    conditions: Record<string, any>,
  ): Promise<ReportHolidayWageDetail | undefined> {
    const dbEntity = await this.knex('report_holiday_wage_detail')
      .where(conditions)
      .first();
    return dbEntity
      ? await toCamelCase<ReportHolidayWageDetail>(dbEntity)
      : undefined;
  }

  async find(
    conditions: Record<string, any> = {},
  ): Promise<ReportHolidayWageDetail[]> {
    const dbEntities = await this.knex('report_holiday_wage_detail').where(
      conditions,
    );
    return Promise.all(
      dbEntities.map(
        async (e) => await toCamelCase<ReportHolidayWageDetail>(e),
      ),
    );
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'holiday_id',
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
          async (e) => await toCamelCase<ReportHolidayWageDetail>(e),
        ),
      ),
    };
  }

  async findByFormId(formId: number): Promise<ReportHolidayWageDetail[]> {
    const dbEntities = await this.knex('report_holiday_wage_detail').where({
      form_id: formId,
    });
    return Promise.all(
      dbEntities.map(
        async (e) => await toCamelCase<ReportHolidayWageDetail>(e),
      ),
    );
  }
}

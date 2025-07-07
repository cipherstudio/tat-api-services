import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { KnexBaseRepository } from 'src/common/repositories/knex-base.repository';
import { KnexService } from 'src/database/knex-service/knex.service';
import { ReportDailyTravelDetail } from '../entities/report-daily-travel-detail.entity';
import { toSnakeCase, toCamelCase } from 'src/common/utils/case-mapping';

@Injectable()
export class ReportDailyTravelDetailRepository extends KnexBaseRepository<ReportDailyTravelDetail> {
  constructor(
    @Inject(KnexService) protected readonly knexService: KnexService,
  ) {
    super(knexService, 'report_daily_travel_detail');
  }

  async createOne(
    dto: Partial<ReportDailyTravelDetail>,
  ): Promise<ReportDailyTravelDetail> {
    const data = await toSnakeCase(dto);
    const [created] = await this.knex('report_daily_travel_detail')
      .insert(data)
      .returning('*');
    return toCamelCase<ReportDailyTravelDetail>(created);
  }

  async updateOne(
    detailId: number,
    dto: Partial<ReportDailyTravelDetail>,
  ): Promise<ReportDailyTravelDetail> {
    const data = await toSnakeCase(dto);
    const [updated] = await this.knex('report_daily_travel_detail')
      .where({ detail_id: detailId })
      .update(data)
      .returning('*');
    if (!updated) throw new NotFoundException('Detail not found');
    return toCamelCase<ReportDailyTravelDetail>(updated);
  }

  async findById(detailId: number): Promise<ReportDailyTravelDetail> {
    const row = await this.knex('report_daily_travel_detail')
      .where({ detail_id: detailId })
      .first();
    if (!row) throw new NotFoundException('Detail not found');
    return toCamelCase<ReportDailyTravelDetail>(row);
  }

  async findByFormId(formId: number): Promise<ReportDailyTravelDetail[]> {
    const rows = await this.knex('report_daily_travel_detail').where({
      form_id: formId,
    });
    return Promise.all(
      rows.map((row) => toCamelCase<ReportDailyTravelDetail>(row)),
    );
  }

  async delete(detailId: number): Promise<number> {
    return this.knex('report_daily_travel_detail')
      .where({ detail_id: detailId })
      .del();
  }
}

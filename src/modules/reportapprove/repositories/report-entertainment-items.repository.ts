import { Injectable } from '@nestjs/common';
import { KnexBaseRepository } from 'src/common/repositories/knex-base.repository';
import { ReportEntertainmentItems } from '../entities/report-entertainment-items.entity';
import { KnexService } from 'src/database/knex-service/knex.service';

@Injectable()
export class ReportEntertainmentItemsRepository extends KnexBaseRepository<ReportEntertainmentItems> {
  constructor(protected readonly knexService: KnexService) {
    super(knexService, 'report_entertainment_items');
  }

  async findByReportId(reportId: number) {
    return this.knex('report_entertainment_items')
      .where('report_id', reportId)
      .orderBy('display_order', 'asc')
      .select('*');
  }

  async deleteByReportId(reportId: number) {
    return this.knex('report_entertainment_items')
      .where('report_id', reportId)
      .del();
  }

  async calculateTotalByReportId(reportId: number) {
    const result = await this.knex('report_entertainment_items')
      .where('report_id', reportId)
      .sum('amount as total')
      .first();

    return Number(result?.total || 0);
  }
}

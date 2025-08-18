import { Injectable, Inject } from '@nestjs/common';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { ReportOtherExpenseList, ReportOtherExpenseListReceipt } from '../entities/report-other-expense-list.entity';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class ReportOtherExpenseListRepository extends KnexBaseRepository<ReportOtherExpenseList> {
  constructor(
    @Inject(KnexService) knexService: KnexService
  ) {
    super(knexService, 'report_other_expense_list');
  }

  async create(entity: Partial<ReportOtherExpenseList>): Promise<ReportOtherExpenseList> {
    const dbData = await toSnakeCase(entity);
    const [created] = await this.knex('report_other_expense_list')
      .insert(dbData)
      .returning('*');
    return await toCamelCase<ReportOtherExpenseList>(created);
  }

  async update(
    id: number,
    entity: Partial<ReportOtherExpenseList>,
  ): Promise<ReportOtherExpenseList> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await this.knex('report_other_expense_list')
      .where({ list_id: id })
      .update(dbEntity);
    return await toCamelCase<ReportOtherExpenseList>(updated);
  }

  async deleteByReportId(reportId: number): Promise<number> {
    // ลบ receipts ทั้งหมดของรายการในรายงานนี้ก่อน เพื่อหลีกเลี่ยง FK constraint
    const lists = await this.knex('report_other_expense_list')
      .where({ report_id: reportId })
      .select('list_id');
    const listIds = lists.map((l) => l.list_id);
    if (listIds.length > 0) {
      await this.knex('report_other_expense_list_receipts')
        .whereIn('list_id', listIds)
        .del();
    }
    return this.knex('report_other_expense_list')
      .where({ report_id: reportId })
      .del();
  }

  async findById(id: number): Promise<ReportOtherExpenseList | undefined> {
    const dbEntity = await this.knex('report_other_expense_list')
      .where({ list_id: id })
      .first();
    return dbEntity
      ? await toCamelCase<ReportOtherExpenseList>(dbEntity)
      : undefined;
  }

  async findByReportId(reportId: number): Promise<ReportOtherExpenseList[]> {
    const rows = await this.knex('report_other_expense_list')
      .where({ report_id: reportId })
      .select('*')
      .orderBy('list_id', 'asc');
    return Promise.all(rows.map((r) => toCamelCase<ReportOtherExpenseList>(r)));
  }

  async findOne(
    conditions: Record<string, any>,
  ): Promise<ReportOtherExpenseList | undefined> {
    const dbEntity = await this.knex('report_other_expense_list')
      .where(conditions)
      .first();
    return dbEntity
      ? await toCamelCase<ReportOtherExpenseList>(dbEntity)
      : undefined;
  }

  async createReceipt(receipt: Omit<ReportOtherExpenseListReceipt, 'receiptId' | 'createdAt' | 'updatedAt'>): Promise<ReportOtherExpenseListReceipt> {
    const [createdReceipt] = await this.knex('report_other_expense_list_receipts')
      .insert({
        list_id: receipt.listId,
        receipt_detail_id: receipt.receiptDetailId,
        detail: receipt.detail,
        amount: receipt.amount
      })
      .returning('*');
    return await toCamelCase<ReportOtherExpenseListReceipt>(createdReceipt);
  }

  async updateReceipt(
    id: number,
    receipt: Partial<ReportOtherExpenseListReceipt>,
  ): Promise<ReportOtherExpenseListReceipt> {
    const dbReceipt = await toSnakeCase(receipt);
    const updated = await this.knex('report_other_expense_list_receipts')
      .where({ receipt_id: id })
      .update(dbReceipt);
    return await toCamelCase<ReportOtherExpenseListReceipt>(updated);
  }

  async deleteReceipt(id: number): Promise<number> {
    return this.knex('report_other_expense_list_receipts')
      .where({ receipt_id: id })
      .del();
  }
}

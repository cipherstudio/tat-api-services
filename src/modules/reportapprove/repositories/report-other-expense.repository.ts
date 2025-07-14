import { Injectable } from '@nestjs/common';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { ReportOtherExpense } from '../entities/report-other-expense.entity';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class ReportOtherExpenseRepository extends KnexBaseRepository<ReportOtherExpense> {
  constructor(knexService: KnexService) {
    super(knexService, 'report_other_expense');
  }

  async create(
    entity: Partial<ReportOtherExpense>,
  ): Promise<ReportOtherExpense> {
    const dbEntity = await toSnakeCase(entity);
    const [created] = await this.knex('report_other_expense')
      .insert(dbEntity)
      .returning('*');
    return await toCamelCase<ReportOtherExpense>(created);
  }

  async update(
    id: number,
    entity: Partial<ReportOtherExpense>,
  ): Promise<ReportOtherExpense> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await this.knex('report_other_expense')
      .where({ expense_id: id })
      .update(dbEntity);
    return await toCamelCase<ReportOtherExpense>(updated);
  }

  async findById(id: number): Promise<ReportOtherExpense | undefined> {
    const dbEntity = await this.knex('report_other_expense')
      .where({ expense_id: id })
      .first();
    return dbEntity
      ? await toCamelCase<ReportOtherExpense>(dbEntity)
      : undefined;
  }

  async findOne(
    conditions: Record<string, any>,
  ): Promise<ReportOtherExpense | undefined> {
    const dbEntity = await this.knex('report_other_expense')
      .where(await toSnakeCase(conditions))
      .first();
    return dbEntity
      ? await toCamelCase<ReportOtherExpense>(dbEntity)
      : undefined;
  }

  async find(
    conditions: Record<string, any> = {},
  ): Promise<ReportOtherExpense[]> {
    const dbEntities = await this.knex('report_other_expense').where(
      await toSnakeCase(conditions),
    );
    return Promise.all(
      dbEntities.map(async (e) => await toCamelCase<ReportOtherExpense>(e)),
    );
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'expense_id',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    const dbOrderBy = await toSnakeCase({ [orderBy]: null });
    const dbOrderByKey = Object.keys(dbOrderBy)[0];
    const offset = (page - 1) * limit;
    const query = this.knex('report_other_expense').where(
      await toSnakeCase(conditions),
    );
    const countResult = await query.clone().count('* as count').first();
    const total = Number(countResult?.count || 0);
    const data = await query
      .orderBy(dbOrderByKey, direction)
      .limit(limit)
      .offset(offset);
    return {
      data: await Promise.all(
        data.map(async (e) => await toCamelCase<ReportOtherExpense>(e)),
      ),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findByFormId(formId: number): Promise<ReportOtherExpense[]> {
    const dbEntities = await this.knex('report_other_expense').where({
      form_id: formId,
    });
    return Promise.all(
      dbEntities.map(async (e) => await toCamelCase<ReportOtherExpense>(e)),
    );
  }
}

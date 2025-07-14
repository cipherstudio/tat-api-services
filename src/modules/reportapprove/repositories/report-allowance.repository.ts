import { Injectable } from '@nestjs/common';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { ReportAllowance } from '../entities/report-allowance.entity';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class ReportAllowanceRepository extends KnexBaseRepository<ReportAllowance> {
  constructor(knexService: KnexService) {
    super(knexService, 'report_allowance');
  }

  async create(entity: Partial<ReportAllowance>): Promise<ReportAllowance> {
    const dbEntity = await toSnakeCase(entity);
    const [created] = await this.knex('report_allowance')
      .insert(dbEntity)
      .returning('*');
    return await toCamelCase<ReportAllowance>(created);
  }

  async update(
    id: number,
    entity: Partial<ReportAllowance>,
  ): Promise<ReportAllowance> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await this.knex('report_allowance')
      .where({ allowance_id: id })
      .update(dbEntity);
    return await toCamelCase<ReportAllowance>(updated[0]);
  }

  async findById(id: number): Promise<ReportAllowance | undefined> {
    const dbEntity = await this.knex('report_allowance')
      .where({ allowance_id: id })
      .first();
    return dbEntity ? await toCamelCase<ReportAllowance>(dbEntity) : undefined;
  }

  async findOne(
    conditions: Record<string, any>,
  ): Promise<ReportAllowance | undefined> {
    const dbEntity = await this.knex('report_allowance')
      .where(await toSnakeCase(conditions))
      .first();
    return dbEntity ? await toCamelCase<ReportAllowance>(dbEntity) : undefined;
  }

  async find(conditions: Record<string, any> = {}): Promise<ReportAllowance[]> {
    const dbEntities = await this.knex('report_allowance').where(
      await toSnakeCase(conditions),
    );
    return Promise.all(
      dbEntities.map(async (e) => await toCamelCase<ReportAllowance>(e)),
    );
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'allowance_id',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    const dbOrderBy = await toSnakeCase({ [orderBy]: null });
    const dbOrderByKey = Object.keys(dbOrderBy)[0];
    const offset = (page - 1) * limit;
    const query = this.knex('report_allowance').where(
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
        data.map(async (e) => await toCamelCase<ReportAllowance>(e)),
      ),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findByFormId(formId: number): Promise<ReportAllowance[]> {
    const dbEntities = await this.knex('report_allowance').where({
      form_id: formId,
    });
    return Promise.all(
      dbEntities.map(async (e) => await toCamelCase<ReportAllowance>(e)),
    );
  }
}

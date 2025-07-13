import { Injectable } from '@nestjs/common';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { ReportTransportation } from '../entities/report-transportation.entity';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class ReportTransportationRepository extends KnexBaseRepository<ReportTransportation> {
  constructor(knexService: KnexService) {
    super(knexService, 'report_transportation');
  }

  async create(
    entity: Partial<ReportTransportation>,
  ): Promise<ReportTransportation> {
    const dbEntity = await toSnakeCase(entity);
    const [created] = await this.knex('report_transportation')
      .insert(dbEntity)
      .returning('*');
    return await toCamelCase<ReportTransportation>(created);
  }

  async update(
    id: number,
    entity: Partial<ReportTransportation>,
  ): Promise<ReportTransportation> {
    const dbEntity = await toSnakeCase(entity);
    const [updated] = await this.knex('report_transportation')
      .where({ transport_id: id })
      .update(dbEntity)
      .returning('*');
    return await toCamelCase<ReportTransportation>(updated);
  }

  async findById(id: number): Promise<ReportTransportation | undefined> {
    const dbEntity = await this.knex('report_transportation')
      .where({ transport_id: id })
      .first();
    return dbEntity
      ? await toCamelCase<ReportTransportation>(dbEntity)
      : undefined;
  }

  async findOne(
    conditions: Record<string, any>,
  ): Promise<ReportTransportation | undefined> {
    const dbEntity = await this.knex('report_transportation')
      .where(await toSnakeCase(conditions))
      .first();
    return dbEntity
      ? await toCamelCase<ReportTransportation>(dbEntity)
      : undefined;
  }

  async find(
    conditions: Record<string, any> = {},
  ): Promise<ReportTransportation[]> {
    const dbEntities = await this.knex('report_transportation').where(
      await toSnakeCase(conditions),
    );
    return Promise.all(
      dbEntities.map(async (e) => await toCamelCase<ReportTransportation>(e)),
    );
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'transport_id',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    const dbOrderBy = await toSnakeCase({ [orderBy]: null });
    const dbOrderByKey = Object.keys(dbOrderBy)[0];
    const offset = (page - 1) * limit;
    const query = this.knex('report_transportation').where(
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
        data.map(async (e) => await toCamelCase<ReportTransportation>(e)),
      ),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findByFormId(formId: number): Promise<ReportTransportation[]> {
    const dbEntities = await this.knex('report_transportation').where({
      form_id: formId,
    });
    return Promise.all(
      dbEntities.map(async (e) => await toCamelCase<ReportTransportation>(e)),
    );
  }
}

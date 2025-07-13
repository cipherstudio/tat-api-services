import { Injectable } from '@nestjs/common';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { ReportAccommodation } from '../entities/report-accommodation.entity';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class ReportAccommodationRepository extends KnexBaseRepository<ReportAccommodation> {
  constructor(knexService: KnexService) {
    super(knexService, 'report_accommodation');
  }

  async create(
    entity: Partial<ReportAccommodation>,
  ): Promise<ReportAccommodation> {
    const dbEntity = await toSnakeCase(entity);
    const [created] = await this.knex('report_accommodation')
      .insert(dbEntity)
      .returning('*');
    return await toCamelCase<ReportAccommodation>(created);
  }

  async update(
    id: number,
    entity: Partial<ReportAccommodation>,
  ): Promise<ReportAccommodation> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await this.knex('report_accommodation')
      .where({ accommodation_id: id })
      .update(dbEntity);
    return await toCamelCase<ReportAccommodation>(updated);
  }

  async findById(id: number): Promise<ReportAccommodation | undefined> {
    const dbEntity = await this.knex('report_accommodation')
      .where({ accommodation_id: id })
      .first();
    return dbEntity
      ? await toCamelCase<ReportAccommodation>(dbEntity)
      : undefined;
  }

  async findOne(
    conditions: Record<string, any>,
  ): Promise<ReportAccommodation | undefined> {
    const dbEntity = await this.knex('report_accommodation')
      .where(await toSnakeCase(conditions))
      .first();
    return dbEntity
      ? await toCamelCase<ReportAccommodation>(dbEntity)
      : undefined;
  }

  async find(
    conditions: Record<string, any> = {},
  ): Promise<ReportAccommodation[]> {
    const dbEntities = await this.knex('report_accommodation').where(
      await toSnakeCase(conditions),
    );
    return Promise.all(
      dbEntities.map(async (e) => await toCamelCase<ReportAccommodation>(e)),
    );
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'accommodation_id',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    const dbOrderBy = await toSnakeCase({ [orderBy]: null });
    const dbOrderByKey = Object.keys(dbOrderBy)[0];
    const offset = (page - 1) * limit;
    const query = this.knex('report_accommodation').where(
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
        data.map(async (e) => await toCamelCase<ReportAccommodation>(e)),
      ),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findByFormId(formId: number): Promise<ReportAccommodation[]> {
    const dbEntities = await this.knex('report_accommodation').where({
      form_id: formId,
    });
    return Promise.all(
      dbEntities.map(async (e) => await toCamelCase<ReportAccommodation>(e)),
    );
  }
}

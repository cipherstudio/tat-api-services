import { Injectable } from '@nestjs/common';
import { Approval } from '../entities/approval.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';
import type { Knex } from 'knex';

@Injectable()
export class ApprovalRepository extends KnexBaseRepository<Approval> {
  constructor(knexService: KnexService) {
    super(knexService, 'approvals');
  }

  async create(data: Partial<Approval>, trx?: Knex.Transaction): Promise<Approval> {
    const snakeCaseData = toSnakeCase(data);
    const [id] = await (trx || this.knexService.knex)(this.tableName)
      .insert(snakeCaseData)
      .returning('id');

    return this.findById(id);
  }

  async update(id: number, entity: Partial<Approval>, trx?: Knex.Transaction): Promise<Approval> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await (trx || this.knexService.knex)(this.tableName)
      .where('id', id)
      .update({
        ...dbEntity,
        updated_at: new Date()
      })
      .returning('*')
      .then(rows => rows[0]);
    return await toCamelCase<Approval>(updated);
  }

  async findById(id: number): Promise<Approval | undefined> {
    const dbEntity = await super.findById(id);
    return dbEntity ? await toCamelCase<Approval>(dbEntity) : undefined;
  }

  async findOne(conditions: Record<string, any>): Promise<Approval | undefined> {
    const dbEntity = await super.findOne(conditions);
    return dbEntity ? await toCamelCase<Approval>(dbEntity) : undefined;
  }

  async find(conditions: Record<string, any> = {}): Promise<Approval[]> {
    const dbEntities = await super.find(conditions);
    return Promise.all(dbEntities.map(async (e) => await toCamelCase<Approval>(e)));
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    const result = await super.findWithPagination(page, limit, conditions, orderBy, direction);
    const totalPages = Math.ceil(result.meta.total / limit);
    return {
      ...result,
      meta: {
        ...result.meta,
        totalPages,
        lastPage: totalPages
      },
      data: await Promise.all(result.data.map(async (e) => await toCamelCase<Approval>(e))),
    };
  }

  async softDelete(id: number): Promise<boolean> {
    const result = await this.knexService
      .knex(this.tableName)
      .where('id', id)
      .update({
        deleted_at: new Date(),
      });
    return result > 0;
  }

  // Add custom repository methods here as needed
}

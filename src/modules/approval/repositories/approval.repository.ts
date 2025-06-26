import { Injectable } from '@nestjs/common';
import { Approval } from '../entities/approval.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class ApprovalRepository extends KnexBaseRepository<Approval> {
  constructor(knexService: KnexService) {
    super(knexService, 'approval');
  }

  async create(data: Partial<Approval>): Promise<Approval> {
    const snakeCaseData = await toSnakeCase(data);
    const created = await this.knexService.create(
      this.tableName,
      snakeCaseData,
    );
    return await toCamelCase<Approval>(created);
  }

  async update(id: number, entity: Partial<Approval>): Promise<Approval> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await this.knexService.update(this.tableName, id, dbEntity);
    return await toCamelCase<Approval>(updated);
  }

  async findById(id: number): Promise<Approval | undefined> {
    const dbEntity = await this.knexService.findById(this.tableName, id);
    return dbEntity ? await toCamelCase<Approval>(dbEntity) : undefined;
  }

  async findOne(
    conditions: Record<string, any>,
  ): Promise<Approval | undefined> {
    const dbEntity = await this.knexService.findOne(this.tableName, conditions);
    return dbEntity ? await toCamelCase<Approval>(dbEntity) : undefined;
  }

  async find(conditions: Record<string, any> = {}): Promise<Approval[]> {
    const dbEntities = await this.knexService.findMany(
      this.tableName,
      conditions,
    );
    return Promise.all(
      dbEntities.map(async (e) => await toCamelCase<Approval>(e)),
    );
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    const snakeCaseConditions = await toSnakeCase(conditions);

    const result = await this.knexService.findWithPagination(
      this.tableName,
      page,
      limit,
      snakeCaseConditions,
      orderBy,
      direction,
    );
    const totalPages = Math.ceil(result.meta.total / limit);
    return {
      ...result,
      meta: {
        ...result.meta,
        totalPages,
        lastPage: totalPages,
      },
      data: await Promise.all(
        result.data.map(async (e) => await toCamelCase<Approval>(e)),
      ),
    };
  }

  async softDelete(id: number): Promise<boolean> {
    const result = await this.knexService.update(this.tableName, id, {
      deleted_at: new Date(),
    });
    return result !== undefined;
  }

  // Add custom repository methods here as needed
}

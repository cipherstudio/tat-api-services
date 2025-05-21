import { Injectable } from '@nestjs/common';
import { Dataviews } from '../entities/dataviews.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class DataviewsRepository extends KnexBaseRepository<Dataviews> {
  constructor(knexService: KnexService) {
    super(knexService, 'dataviewss');
  }

  async create(entity: Partial<Dataviews>): Promise<Dataviews> {
    const dbEntity = await toSnakeCase(entity);
    const created = await super.create(dbEntity);
    return await toCamelCase<Dataviews>(created);
  }

  async update(id: number, entity: Partial<Dataviews>): Promise<Dataviews> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await super.update(id, dbEntity);
    return await toCamelCase<Dataviews>(updated);
  }

  async findById(id: number): Promise<Dataviews | undefined> {
    const dbEntity = await super.findById(id);
    return dbEntity ? await toCamelCase<Dataviews>(dbEntity) : undefined;
  }

  async findOne(
    conditions: Record<string, any>,
  ): Promise<Dataviews | undefined> {
    const dbEntity = await super.findOne(conditions);
    return dbEntity ? await toCamelCase<Dataviews>(dbEntity) : undefined;
  }

  async find(conditions: Record<string, any> = {}): Promise<Dataviews[]> {
    const dbEntities = await super.find(conditions);
    return Promise.all(
      dbEntities.map(async (e) => await toCamelCase<Dataviews>(e)),
    );
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'id',
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
        result.data.map(async (e) => await toCamelCase<Dataviews>(e)),
      ),
    };
  }

  // Add custom repository methods here as needed
}

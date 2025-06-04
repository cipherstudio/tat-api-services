import { Injectable } from '@nestjs/common';
import { Files } from '../entities/files.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class FilesRepository extends KnexBaseRepository<Files> {
  constructor(knexService: KnexService) {
    super(knexService, 'files');
  }

  async create(entity: Partial<Files>): Promise<Files> {
    const dbEntity = await toSnakeCase(entity);
    const created = await super.create(dbEntity);
    return await toCamelCase<Files>(created);
  }

  async update(id: number, entity: Partial<Files>): Promise<Files> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await super.update(id, dbEntity);
    return await toCamelCase<Files>(updated);
  }

  async findById(id: number): Promise<Files | undefined> {
    const dbEntity = await super.findById(id);
    return dbEntity ? await toCamelCase<Files>(dbEntity) : undefined;
  }

  async findOne(conditions: Record<string, any>): Promise<Files | undefined> {
    const dbEntity = await super.findOne(conditions);
    return dbEntity ? await toCamelCase<Files>(dbEntity) : undefined;
  }

  async find(conditions: Record<string, any> = {}): Promise<Files[]> {
    const dbEntities = await super.find(conditions);
    return Promise.all(
      dbEntities.map(async (e) => await toCamelCase<Files>(e)),
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
        result.data.map(async (e) => await toCamelCase<Files>(e)),
      ),
    };
  }

  // Add custom repository methods here as needed
}

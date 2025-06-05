import { Injectable } from '@nestjs/common';
import { DisbursementSupportingQuestion } from '../entities/disbursement-supporting-question.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class DisbursementSupportingQuestionRepository extends KnexBaseRepository<DisbursementSupportingQuestion> {
  constructor(knexService: KnexService) {
    super(knexService, 'disbursement_supporting_questions');
  }

  async create(
    entity: Partial<DisbursementSupportingQuestion>,
  ): Promise<DisbursementSupportingQuestion> {
    const dbEntity = await toSnakeCase(entity);
    const created = await super.create(dbEntity);
    return await toCamelCase<DisbursementSupportingQuestion>(created);
  }

  async update(
    id: number,
    entity: Partial<DisbursementSupportingQuestion>,
  ): Promise<DisbursementSupportingQuestion> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await super.update(id, dbEntity);
    return await toCamelCase<DisbursementSupportingQuestion>(updated);
  }

  async findById(
    id: number,
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ): Promise<DisbursementSupportingQuestion | undefined> {
    const dbEntity = await super.findById(id, orderBy, direction);
    return dbEntity
      ? await toCamelCase<DisbursementSupportingQuestion>(dbEntity)
      : undefined;
  }

  async findOne(
    conditions: Record<string, any>,
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ): Promise<DisbursementSupportingQuestion | undefined> {
    const dbEntity = await super.findOne(conditions, orderBy, direction);
    return dbEntity
      ? await toCamelCase<DisbursementSupportingQuestion>(dbEntity)
      : undefined;
  }

  async find(
    conditions: Record<string, any> = {},
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ): Promise<DisbursementSupportingQuestion[]> {
    const dbEntities = await super.find(conditions, orderBy, direction);
    return Promise.all(
      dbEntities.map(
        async (e) => await toCamelCase<DisbursementSupportingQuestion>(e),
      ),
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
        result.data.map(
          async (e) => await toCamelCase<DisbursementSupportingQuestion>(e),
        ),
      ),
    };
  }
}

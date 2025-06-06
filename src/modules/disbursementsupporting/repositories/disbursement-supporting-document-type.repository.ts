import { Injectable } from '@nestjs/common';
import { DisbursementSupportingDocumentType } from '../entities/disbursementsupporting.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class DisbursementSupportingDocumentTypeRepository extends KnexBaseRepository<DisbursementSupportingDocumentType> {
  constructor(knexService: KnexService) {
    super(knexService, 'disbursement_supporting_document_types');
  }

  async create(
    entity: Partial<DisbursementSupportingDocumentType>,
  ): Promise<DisbursementSupportingDocumentType> {
    const dbEntity = await toSnakeCase(entity);
    const created = await super.create(dbEntity);
    return await toCamelCase<DisbursementSupportingDocumentType>(created);
  }

  async update(
    id: number,
    entity: Partial<DisbursementSupportingDocumentType>,
  ): Promise<DisbursementSupportingDocumentType> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await super.update(id, dbEntity);
    return await toCamelCase<DisbursementSupportingDocumentType>(updated);
  }

  async findById(
    id: number,
  ): Promise<DisbursementSupportingDocumentType | undefined> {
    const dbEntity = await super.findById(id);
    return dbEntity
      ? await toCamelCase<DisbursementSupportingDocumentType>(dbEntity)
      : undefined;
  }

  async findOne(
    conditions: Record<string, any>,
  ): Promise<DisbursementSupportingDocumentType | undefined> {
    const dbEntity = await super.findOne(conditions);
    return dbEntity
      ? await toCamelCase<DisbursementSupportingDocumentType>(dbEntity)
      : undefined;
  }

  async find(
    conditions: Record<string, any> = {},
  ): Promise<DisbursementSupportingDocumentType[]> {
    const dbEntities = await super.find(conditions);
    return Promise.all(
      dbEntities.map(
        async (e) => await toCamelCase<DisbursementSupportingDocumentType>(e),
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
          async (e) => await toCamelCase<DisbursementSupportingDocumentType>(e),
        ),
      ),
    };
  }
}

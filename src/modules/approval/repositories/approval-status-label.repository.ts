import { Injectable } from '@nestjs/common';
import { ApprovalStatusLabel } from '../entities/approval-status-label.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';

@Injectable()
export class ApprovalStatusLabelRepository extends KnexBaseRepository<ApprovalStatusLabel> {
  constructor(knexService: KnexService) {
    super(knexService, 'approval_status_labels');
  }

  async findAll(): Promise<ApprovalStatusLabel[]> {
    const dbEntities = await this.knexService.knex(this.tableName)
      .orderBy('id', 'asc')
      .select('*');
    
    return Promise.all(dbEntities.map(async (e) => await toCamelCase<ApprovalStatusLabel>(e)));
  }

  async findById(id: number): Promise<ApprovalStatusLabel | undefined> {
    const dbEntity = await this.knexService.findById(this.tableName, id);
    return dbEntity ? await toCamelCase<ApprovalStatusLabel>(dbEntity) : undefined;
  }

  async findByStatusCode(statusCode: string): Promise<ApprovalStatusLabel | undefined> {
    const dbEntity = await this.knexService.findOne(this.tableName, { status_code: statusCode });
    return dbEntity ? await toCamelCase<ApprovalStatusLabel>(dbEntity) : undefined;
  }
} 
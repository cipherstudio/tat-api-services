import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KnexService } from '../../../database/knex-service/knex.service';
import { ApprovalAttachment, approvalAttachmentColumnMap, approvalAttachmentReverseColumnMap } from '../entities/approval-attachment.entity';

@Injectable()
export class ApprovalAttachmentRepository {
  private readonly tableName = 'approval_attachments';

  constructor(private knexService: KnexService) {}

  private queryBuilder(trx?: Knex.Transaction) {
    return (trx ?? this.knexService.knex)(this.tableName);
  }

  async findByEntity(entityType: string, entityId: number, trx?: Knex.Transaction): Promise<ApprovalAttachment[]> {
    const results = await this.queryBuilder(trx)
      .where({ entity_type: entityType, entity_id: entityId })
      .orderBy('created_at', 'asc');
    
    return results.map(this.mapToEntity);
  }

  async createMany(attachments: Partial<ApprovalAttachment>[], trx?: Knex.Transaction): Promise<void> {
    const dbData = attachments.map(this.mapToDatabase);
    await this.queryBuilder(trx).insert(dbData);
  }

  async deleteByEntity(entityType: string, entityId: number, trx?: Knex.Transaction): Promise<void> {
    await this.queryBuilder(trx)
      .where({ entity_type: entityType, entity_id: entityId })
      .delete();
  }

  async deleteByEntityAndFiles(entityType: string, entityId: number, fileIds: number[], trx?: Knex.Transaction): Promise<void> {
    await this.queryBuilder(trx)
      .where({ entity_type: entityType, entity_id: entityId })
      .whereIn('file_id', fileIds)
      .delete();
  }

  private mapToEntity = (dbRecord: any): ApprovalAttachment => {
    const mapped: any = {};
    for (const [dbColumn, entityProperty] of Object.entries(approvalAttachmentColumnMap)) {
      if (dbRecord.hasOwnProperty(dbColumn)) {
        mapped[entityProperty] = dbRecord[dbColumn];
      }
    }
    return mapped as ApprovalAttachment;
  };

  private mapToDatabase = (entity: Partial<ApprovalAttachment>): any => {
    const mapped: any = {};
    for (const [entityProperty, dbColumn] of Object.entries(approvalAttachmentReverseColumnMap)) {
      if (entity.hasOwnProperty(entityProperty)) {
        mapped[dbColumn] = entity[entityProperty as keyof ApprovalAttachment];
      }
    }
    return mapped;
  };
} 
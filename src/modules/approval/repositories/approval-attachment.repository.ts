import { Injectable } from '@nestjs/common';
import { KnexService } from '../../../database/knex-service/knex.service';
import { ApprovalAttachment, approvalAttachmentColumnMap, approvalAttachmentReverseColumnMap } from '../entities/approval-attachment.entity';

@Injectable()
export class ApprovalAttachmentRepository {
  private readonly tableName = 'approval_attachments';

  constructor(private knexService: KnexService) {}

  async findByEntity(entityType: string, entityId: number): Promise<ApprovalAttachment[]> {
    const results = await this.knexService.knex(this.tableName)
      .where({ entity_type: entityType, entity_id: entityId })
      .orderBy('created_at', 'asc');
    
    return results.map(this.mapToEntity);
  }

  async createMany(attachments: Partial<ApprovalAttachment>[]): Promise<void> {
    const dbData = attachments.map(this.mapToDatabase);
    await this.knexService.knex(this.tableName).insert(dbData);
  }

  async deleteByEntity(entityType: string, entityId: number): Promise<void> {
    await this.knexService.knex(this.tableName)
      .where({ entity_type: entityType, entity_id: entityId })
      .delete();
  }

  async deleteByEntityAndFiles(entityType: string, entityId: number, fileIds: number[]): Promise<void> {
    await this.knexService.knex(this.tableName)
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
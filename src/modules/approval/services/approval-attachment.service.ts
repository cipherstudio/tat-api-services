import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { ApprovalAttachmentRepository } from '../repositories/approval-attachment.repository';
import { FilesService } from '../../files/files.service';
import { CreateAttachmentDto, AttachmentResponseDto } from '../dto/approval-attachment.dto';
import { ApprovalAttachment } from '../entities/approval-attachment.entity';

@Injectable()
export class ApprovalAttachmentService {
  constructor(
    private attachmentRepository: ApprovalAttachmentRepository,
    private filesService: FilesService,
  ) {}

  async getAttachments(entityType: string, entityId: number): Promise<AttachmentResponseDto[]> {
    const attachments = await this.attachmentRepository.findByEntity(entityType, entityId);
    
    // Join กับตาราง files เพื่อดึงข้อมูลไฟล์
    const attachmentsWithFiles = await Promise.all(
      attachments.map(async (attachment) => {
        try {
          const file = await this.filesService.findById(attachment.fileId);
          return {
            id: attachment.id,
            entityType: attachment.entityType,
            entityId: attachment.entityId,
            fileId: attachment.fileId,
            fileName: file.originalName,
            filePath: file.path,
            size: file.size,
            createdAt: attachment.createdAt,
            updatedAt: attachment.updatedAt,
          } as AttachmentResponseDto;
        } catch (error) {
          return null;
        }
      })
    );

    return attachmentsWithFiles.filter((attachment) => attachment !== null);
  }

  /**
   * Sync attachment records within a transaction and return file IDs
   * that should be deleted afterwards (outside the transaction).
   */
  async syncAttachments(
    entityType: string,
    entityId: number,
    attachments: CreateAttachmentDto[],
    trx?: Knex.Transaction,
  ): Promise<number[]> {
    const oldAttachments = await this.attachmentRepository.findByEntity(entityType, entityId, trx);
    const oldFileIds = oldAttachments.map(att => att.fileId);
    const newFileIds = attachments.map(att => att.fileId);
    const filesToDelete = oldFileIds.filter(oldId => !newFileIds.includes(oldId));

    await this.attachmentRepository.deleteByEntity(entityType, entityId, trx);

    if (attachments.length > 0) {
      const attachmentData: Partial<ApprovalAttachment>[] = attachments.map((attachment) => ({
        entityType,
        entityId,
        fileId: attachment.fileId,
      }));
      await this.attachmentRepository.createMany(attachmentData, trx);
    }

    return filesToDelete;
  }

  /**
   * Delete file records and physical files. Intended to be called
   * after a transaction has been committed so that file deletion
   * does not hold DB locks inside the transaction scope.
   */
  async deleteFilesInBackground(fileIds: number[]): Promise<void> {
    for (const fileId of fileIds) {
      try {
        await this.filesService.remove(fileId);
      } catch (error) {
        console.warn(`Warning: Failed to delete file ${fileId}:`, error.message);
      }
    }
  }

  async updateAttachments(entityType: string, entityId: number, attachments: CreateAttachmentDto[]): Promise<void> {
    const filesToDelete = await this.syncAttachments(entityType, entityId, attachments);
    await this.deleteFilesInBackground(filesToDelete);
  }

  async deleteAttachments(entityType: string, entityId: number): Promise<void> {
    const oldAttachments = await this.attachmentRepository.findByEntity(entityType, entityId);
    const oldFileIds = oldAttachments.map(att => att.fileId);
    
    await this.attachmentRepository.deleteByEntity(entityType, entityId);
    await this.deleteFilesInBackground(oldFileIds);
  }

  async deleteSpecificAttachments(entityType: string, entityId: number, fileIds: number[]): Promise<void> {
    if (fileIds.length > 0) {
      await this.attachmentRepository.deleteByEntityAndFiles(entityType, entityId, fileIds);
      await this.deleteFilesInBackground(fileIds);
    }
  }
} 
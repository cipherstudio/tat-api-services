import { Injectable } from '@nestjs/common';
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
          // ถ้าไฟล์ไม่พบ ให้ข้าม
          return null;
        }
      })
    );

    return attachmentsWithFiles.filter((attachment) => attachment !== null);
  }

  async updateAttachments(entityType: string, entityId: number, attachments: CreateAttachmentDto[]): Promise<void> {
    const oldAttachments = await this.attachmentRepository.findByEntity(entityType, entityId);
    const oldFileIds = oldAttachments.map(att => att.fileId);
    
    const newFileIds = attachments.map(att => att.fileId);
    
    const filesToDelete = oldFileIds.filter(oldId => !newFileIds.includes(oldId));
    
    await this.attachmentRepository.deleteByEntity(entityType, entityId);

    if (attachments.length > 0) {
      const attachmentData: Partial<ApprovalAttachment>[] = attachments.map((attachment) => ({
        entityType,
        entityId,
        fileId: attachment.fileId,
      }));

      await this.attachmentRepository.createMany(attachmentData);
    }
    
    for (const fileId of filesToDelete) {
      try {
        await this.filesService.remove(fileId);
        console.log(`Successfully deleted unused attachment file: ${fileId}`);
      } catch (error) {
        console.warn(`Warning: Failed to delete unused attachment file ${fileId}:`, error.message);
      }
    }
  }

  async deleteAttachments(entityType: string, entityId: number): Promise<void> {
    const oldAttachments = await this.attachmentRepository.findByEntity(entityType, entityId);
    const oldFileIds = oldAttachments.map(att => att.fileId);
    
    await this.attachmentRepository.deleteByEntity(entityType, entityId);
    
    for (const fileId of oldFileIds) {
      try {
        await this.filesService.remove(fileId);
        console.log(`Successfully deleted attachment file: ${fileId}`);
      } catch (error) {
        console.warn(`Warning: Failed to delete attachment file ${fileId}:`, error.message);
      }
    }
  }

  async deleteSpecificAttachments(entityType: string, entityId: number, fileIds: number[]): Promise<void> {
    if (fileIds.length > 0) {
      await this.attachmentRepository.deleteByEntityAndFiles(entityType, entityId, fileIds);
      
      for (const fileId of fileIds) {
        try {
          await this.filesService.remove(fileId);
          console.log(`Successfully deleted specific attachment file: ${fileId}`);
        } catch (error) {
          console.warn(`Warning: Failed to delete specific attachment file ${fileId}:`, error.message);
        }
      }
    }
  }
} 
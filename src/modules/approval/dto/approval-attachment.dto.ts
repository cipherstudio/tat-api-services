import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsIn } from 'class-validator';

export class CreateAttachmentDto {
  @ApiProperty({
    description: 'รหัสไฟล์',
    example: 123,
  })
  @IsNumber()
  fileId: number;
}

export class GetApprovalFilesQueryDto {
  @ApiProperty({
    description: 'ประเภทไฟล์แนบที่ต้องการกรอง',
    required: false,
    enum: ['approval_document', 'approval_signature', 'approval_budgets', 'approval_clothing_expense', 'approval_continuous_signature', 'approval_accommodation_transport_expense'],
    example: 'approval_document'
  })
  @IsOptional()
  @IsIn(['approval_document', 'approval_signature', 'approval_budgets', 'approval_clothing_expense', 'approval_continuous_signature', 'approval_accommodation_transport_expense'])
  type?: string;
}

export class AttachmentResponseDto {
  @ApiProperty({
    description: 'รหัส attachment',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'ประเภท entity',
    example: 'approval',
  })
  entityType: string;

  @ApiProperty({
    description: 'รหัส entity',
    example: 789,
  })
  entityId: number;

  @ApiProperty({
    description: 'รหัสไฟล์',
    example: 123,
  })
  fileId: number;

  @ApiProperty({
    description: 'ชื่อไฟล์',
    example: 'document.pdf',
  })
  fileName: string;

  @ApiProperty({
    description: 'เส้นทางไฟล์',
    example: 'uploads/document.pdf',
  })
  filePath: string;

  @ApiProperty({
    description: 'ขนาดไฟล์ (bytes)',
    example: 1024000,
  })
  size: number;

  @ApiProperty({
    description: 'วันที่สร้าง',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'วันที่อัปเดต',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
} 
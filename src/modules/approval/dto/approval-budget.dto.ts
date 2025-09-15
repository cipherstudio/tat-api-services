import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateAttachmentDto } from './approval-attachment.dto';

export class ApprovalBudgetDto {
  @ApiProperty({
    description: 'ประเภทงบประมาณ',
    example: 'งบประมาณรายจ่ายประจำปี',
    required: false
  })
  @IsString()
  @IsOptional()
  budget_type?: string;

  @ApiProperty({
    description: 'ประเภทรายการ',
    example: 'ค่าอุปกรณ์',
    required: false
  })
  @IsString()
  @IsOptional()
  item_type?: string;

  @ApiProperty({
    description: 'รหัสการจอง',
    example: 'RES001',
    required: false
  })
  @IsString()
  @IsOptional()
  reservation_code?: string;

  @ApiProperty({
    description: 'แผนก',
    example: 'แผนกเทคโนโลยีสารสนเทศ',
    required: false
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({
    description: 'รหัสงบประมาณ',
    example: 'BUD001',
    required: false
  })
  @IsString()
  @IsOptional()
  budget_code?: string;

  @ApiProperty({
    description: 'รหัสไฟล์',
    example: '1',
    required: false
  })
  @IsOptional()
  attachment_id?: number;

  @ApiProperty({
    description: 'กลยุทธ์',
    example: 'กลยุทธ์การพัฒนาองค์กร',
    required: false
  })
  @IsString()
  @IsOptional()
  strategy?: string;

  @ApiProperty({
    description: 'แผนงาน',
    example: 'แผนงานประจำปี 2567',
    required: false
  })
  @IsString()
  @IsOptional()
  plan?: string;

  @ApiProperty({
    description: 'ไฟล์แนบเพิ่มเติม',
    type: [CreateAttachmentDto],
    required: false,
    example: [
      { fileId: 442 },
      { fileId: 443 }
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttachmentDto)
  attachments?: CreateAttachmentDto[];
} 
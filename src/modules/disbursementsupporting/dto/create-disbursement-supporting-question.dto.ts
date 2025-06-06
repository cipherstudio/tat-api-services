import { IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDisbursementSupportingQuestionDto {
  @ApiProperty({ description: 'รหัสฟอร์ม' })
  @IsInt()
  formId: number;

  @ApiProperty({ description: 'ข้อความคำถาม' })
  @IsString()
  questionText: string;

  @ApiProperty({
    description: 'structured content (JSON)',
    required: false,
    type: Object,
  })
  @IsOptional()
  questionContent?: any;
}

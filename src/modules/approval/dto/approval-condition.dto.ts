import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApprovalConditionDto {
  @ApiProperty({ 
    description: 'Condition text',
    required: true,
    example: 'ต้องส่งรายงานการเดินทางภายใน 7 วัน'
  })
  @IsString()
  text: string;
} 
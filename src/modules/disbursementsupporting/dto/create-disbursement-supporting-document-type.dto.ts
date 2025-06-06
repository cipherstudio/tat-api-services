import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDisbursementSupportingDocumentTypeDto {
  @ApiProperty({ description: 'ชื่อประเภทเอกสาร' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'รายละเอียด', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

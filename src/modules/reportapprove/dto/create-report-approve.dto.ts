import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
} from 'class-validator';

export class CreateReportApproveDto {
  @ApiProperty({ example: 'Sample Title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  creatorName: string;

  @ApiProperty({ example: 'EMP001' })
  @IsNotEmpty()
  @IsString()
  creatorCode: string;

  // @ApiProperty({ example: 'DOC-2024-001', required: false })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiProperty({
    example: 1,
    required: false,
    description: 'ไอดีของรายการขออนุมัติ',
  })
  @IsOptional()
  @IsNumber()
  approveId?: number;

  // @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  status?: number;

  // @ApiProperty({ example: '2024-01-01', required: false })
  @IsOptional()
  @IsDate()
  createdAt?: Date;

  // @ApiProperty({ example: '2024-01-01', required: false })
  @IsOptional()
  @IsDate()
  updatedAt?: Date;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReportApproveDto {
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

  @ApiProperty({ example: 'DOC-2024-001' })
  @IsNotEmpty()
  @IsString()
  documentNumber: string;
}

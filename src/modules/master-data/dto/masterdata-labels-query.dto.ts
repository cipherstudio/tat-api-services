import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MasterdataLabelsQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  table_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  document_reference?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  document_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  updated_by?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  limit?: number;
}

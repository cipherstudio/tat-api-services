import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class MasterdataLabelsQueryDto extends CommonQueryDto {
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
  table_description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  updated_by?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchTerm?: string;
}

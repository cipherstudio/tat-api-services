import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEntertainmentItemDto } from './create-entertainment-form.dto';

export class UpdateEntertainmentItemDto extends CreateEntertainmentItemDto {
  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  id?: number;
}

export class UpdateEntertainmentFormDto {
  @ApiProperty({ example: 'EMP001' })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiProperty({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  employeeName?: string;

  @ApiProperty({ example: 'Manager' })
  @IsOptional()
  @IsString()
  employeePosition?: string;

  @ApiProperty({ example: 'IT Department' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ example: 'Development Team' })
  @IsOptional()
  @IsString()
  section?: string;

  @ApiProperty({ example: 'Project Alpha' })
  @IsOptional()
  @IsString()
  job?: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  statusId?: number;

  @ApiProperty({ example: 15000.0 })
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @ApiProperty({ example: 'APP001' })
  @IsOptional()
  @IsString()
  approvedBy?: string;

  @ApiProperty({ example: 'อนุมัติแล้ว' })
  @IsOptional()
  @IsString()
  approvedComment?: string;

  @ApiProperty({ example: 'EMP001' })
  @IsOptional()
  @IsString()
  updatedBy?: string;

  @ApiProperty({ type: [UpdateEntertainmentItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateEntertainmentItemDto)
  items?: UpdateEntertainmentItemDto[];
}

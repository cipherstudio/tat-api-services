import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ApprovalClothingExpenseQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  order_by?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  direction?: 'asc' | 'desc';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  clothing_file_checked?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  clothing_amount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  clothing_reason?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reporting_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  next_claim_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  work_end_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  approval_accommodation_expense_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  staff_member_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  approval_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  employee_code?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  increment_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  destination_country?: string;
}

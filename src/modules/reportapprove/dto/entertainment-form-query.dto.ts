import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export enum EntertainmentFormStatus {
  DRAFT = 1,
  PENDING = 2,
  APPROVED = 3,
  REJECTED = 4,
  CANCELLED = 5,
}

export class EntertainmentFormQueryDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({ example: 'EMP001', required: false })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  employeeName?: string;

  @ApiProperty({ example: 'IT Department', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ example: 'Project Alpha', required: false })
  @IsOptional()
  @IsString()
  job?: string;

  @ApiProperty({ enum: EntertainmentFormStatus, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsEnum(EntertainmentFormStatus)
  statusId?: EntertainmentFormStatus;

  @ApiProperty({ example: 'created_at', required: false })
  @IsOptional()
  @IsString()
  orderBy?: string = 'created_at';

  @ApiProperty({ example: 'desc', required: false })
  @IsOptional()
  @IsString()
  direction?: 'asc' | 'desc' = 'desc';

  @ApiProperty({
    example: '2024-01-01',
    required: false,
    description: 'Start date in YYYY-MM-DD format',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (!value) return value;
    // Ensure date is in YYYY-MM-DD format
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toISOString().split('T')[0];
  })
  startDate?: string;

  @ApiProperty({
    example: '2024-12-31',
    required: false,
    description: 'End date in YYYY-MM-DD format',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (!value) return value;
    // Ensure date is in YYYY-MM-DD format
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toISOString().split('T')[0];
  })
  endDate?: string;

  @ApiProperty({ example: 'search text', required: false })
  @IsOptional()
  @IsString()
  searchTerm?: string;
}

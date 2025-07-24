import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum MeetingExpenseReportStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class MeetingExpenseReportQueryDto {
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
  name?: string;

  @ApiProperty({ example: 'IT Department', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ example: 'Development Team', required: false })
  @IsOptional()
  @IsString()
  section?: string;

  @ApiProperty({ example: 'Project Alpha', required: false })
  @IsOptional()
  @IsString()
  job?: string;

  @ApiProperty({ example: 'ประชุมประจำเดือน', required: false })
  @IsOptional()
  @IsString()
  meetingType?: string;

  @ApiProperty({ enum: MeetingExpenseReportStatus, required: false })
  @IsOptional()
  @IsEnum(MeetingExpenseReportStatus)
  status?: MeetingExpenseReportStatus;

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
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    example: '2024-12-31',
    required: false,
    description: 'End date in YYYY-MM-DD format',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: 'search text', required: false })
  @IsOptional()
  @IsString()
  searchTerm?: string;
}

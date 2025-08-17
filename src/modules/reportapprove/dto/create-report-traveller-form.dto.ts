import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDate } from 'class-validator';

export class CreateReportTravellerFormDto {
  // @ApiProperty({ example: 1 })
  // @IsOptional()
  @IsNumber()
  formId?: number;

  // @ApiProperty({ example: 1 })
  // @IsNotEmpty()
  @IsNumber()
  travelerId?: number;

  // @ApiProperty({ example: 'RPT-2024-001' })
  // @IsNotEmpty()
  @IsString()
  reportId?: number;

  @ApiProperty({ example: 'Developer' })
  @IsOptional()
  @IsString()
  job?: string;

  @ApiProperty({ example: 'IT Department' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ example: '2024-07-03' })
  @IsOptional()
  @IsDate()
  date?: Date;

  @ApiProperty({ example: 'TO-2024-001' })
  @IsOptional()
  @IsString()
  travelOrder?: string;

  @ApiProperty({ example: '2024-07-01' })
  @IsOptional()
  @IsDate()
  travelOrderDate?: Date;

  @ApiProperty({ example: 'Jane Doe, Bob Smith' })
  @IsOptional()
  @IsString()
  companions?: string;

  @ApiProperty({ example: 'Tokyo' })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiProperty({ example: 'Shibuya' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 'Bangkok' })
  @IsOptional()
  @IsString()
  departurePlace?: string;

  @ApiProperty({ example: '2024-07-02' })
  @IsOptional()
  @IsDate()
  departureDate?: Date;

  @ApiProperty({ example: '08:00' })
  @IsOptional()
  @IsString()
  departureTime?: string;

  @ApiProperty({ example: 'Bangkok' })
  @IsOptional()
  @IsString()
  returnPlace?: string;

  @ApiProperty({ example: '2024-07-05' })
  @IsOptional()
  @IsDate()
  returnDate?: Date;

  @ApiProperty({ example: '18:00' })
  @IsOptional()
  @IsString()
  returnTime?: string;

  @ApiProperty({ example: '5 days 10 hours' })
  @IsOptional()
  @IsString()
  totalTime?: string;

  @ApiProperty({ example: 'Business trip details' })
  @IsOptional()
  @IsString()
  travelDetails?: string;

  @ApiProperty({ example: 50000.0 })
  @IsOptional()
  @IsNumber()
  granTotal?: number;

  @ApiProperty({ example: 40000.0 })
  @IsOptional()
  @IsNumber()
  requestApproveAmount?: number;

  @ApiProperty({ example: 10000.0 })
  @IsOptional()
  @IsNumber()
  remainAmount?: number;
}

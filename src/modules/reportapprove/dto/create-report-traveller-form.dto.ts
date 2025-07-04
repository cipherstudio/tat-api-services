import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsDate,
} from 'class-validator';

export class CreateReportTravellerFormDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  traveler_id: number;

  @ApiProperty({ example: 'RPT-2024-001' })
  @IsNotEmpty()
  @IsString()
  report_id: string;

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
  travel_order?: string;

  @ApiProperty({ example: '2024-07-01' })
  @IsOptional()
  @IsDate()
  travel_order_date?: Date;

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
  departure_place?: string;

  @ApiProperty({ example: '2024-07-02' })
  @IsOptional()
  @IsDate()
  departure_date?: Date;

  @ApiProperty({ example: '08:00' })
  @IsOptional()
  @IsString()
  departure_time?: string;

  @ApiProperty({ example: 'Bangkok' })
  @IsOptional()
  @IsString()
  return_place?: string;

  @ApiProperty({ example: '2024-07-05' })
  @IsOptional()
  @IsDate()
  return_date?: Date;

  @ApiProperty({ example: '18:00' })
  @IsOptional()
  @IsString()
  return_time?: string;

  @ApiProperty({ example: '5 days 10 hours' })
  @IsOptional()
  @IsString()
  total_time?: string;

  @ApiProperty({ example: 'Business trip details' })
  @IsOptional()
  @IsString()
  travel_details?: string;

  @ApiProperty({ example: 50000.0 })
  @IsOptional()
  @IsNumber()
  gran_total?: number;

  @ApiProperty({ example: 40000.0 })
  @IsOptional()
  @IsNumber()
  request_approve_amount?: number;

  @ApiProperty({ example: 10000.0 })
  @IsOptional()
  @IsNumber()
  remain_amount?: number;
}

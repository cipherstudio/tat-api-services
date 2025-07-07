import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateReportDailyTravelDetailDto {
  // @ApiProperty({ example: 1 })
  // @IsInt()
  formId?: number;

  @ApiProperty({ example: 'Bangkok' })
  @IsString()
  departurePlace: string;

  @ApiProperty({ example: '2025-07-10' })
  @IsDateString()
  departureDate: string;

  @ApiProperty({ example: '08:00' })
  @IsString()
  departureTime: string;

  @ApiProperty({ example: 'Chiang Mai' })
  @IsString()
  returnPlace: string;

  @ApiProperty({ example: '2025-07-12' })
  @IsDateString()
  returnDate: string;

  @ApiProperty({ example: '18:00' })
  @IsString()
  returnTime: string;

  @ApiProperty({ example: 'รายละเอียดการเดินทาง' })
  @IsString()
  travelDetails: string;
}

export class UpdateReportDailyTravelDetailDto extends PartialType(
  CreateReportDailyTravelDetailDto,
) {
  @ApiProperty({ example: 1 })
  @IsInt()
  detailId: number;
}

export class QueryReportDailyTravelDetailDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  formId?: number;
}

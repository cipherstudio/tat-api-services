import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApprovalDateRangeDto } from './approval-date-range.dto';

export class ApprovalTripEntryDto {
  @ApiProperty({
    description: 'Location of the trip',
    example: 'Bangkok',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Destination of the trip',
    example: 'Phuket',
    required: false,
  })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiProperty({
    description: 'Whether the trip includes nearby provinces',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  nearbyProvinces?: boolean;

  @ApiProperty({
    description: 'Additional details about the trip',
    example: 'Business trip for conference',
    required: false,
  })
  @IsOptional()
  @IsString()
  details?: string;

  @ApiProperty({
    description: 'Type of destination',
    enum: ['domestic', 'international'],
    example: 'domestic',
    required: false,
  })
  @IsOptional()
  @IsEnum(['domestic', 'international'])
  destinationType?: 'domestic' | 'international';

  @ApiProperty({
    description: 'รหัสปลายทาง',
    example: 1,
    required: false
  })
  destinationId?: number;

  @ApiProperty({
    description: 'ชื่อตารางปลายทาง',
    example: 'countries',
    required: false
  })
  destinationTable?: string;

  @ApiProperty({
    description: 'Date ranges for the trip',
    type: [ApprovalDateRangeDto],
    required: false,
  })
  @IsOptional()
  tripDateRanges?: ApprovalDateRangeDto[];
} 
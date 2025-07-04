import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateReportTravellerDto {
  @ApiProperty({ example: 'RPT-2024-001' })
  @IsNotEmpty()
  @IsString()
  report_id: string;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Manager' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ example: 'Senior' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiProperty({ example: 'Official' })
  @IsOptional()
  @IsString()
  type?: string;
}

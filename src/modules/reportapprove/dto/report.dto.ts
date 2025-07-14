import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ReportTravellerForm } from '../entities/report-traveller-form.entity';

export class ReportApproveDto {
  @ApiProperty({ example: 'Sample Title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  creatorName: string;

  @ApiProperty({ example: 'EMP001' })
  @IsNotEmpty()
  @IsString()
  creatorCode: string;

  @ApiProperty({ example: 'DOC-2024-001' })
  @IsNotEmpty()
  @IsString()
  documentNumber: string;

  @ApiProperty({ example: '2024-06-21T10:00:00.000Z' })
  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: '2024-06-21T10:00:00.000Z' })
  @IsNotEmpty()
  @IsDate()
  updatedAt: Date;

  //relations
  @ApiProperty({ type: [ReportTravellerForm] })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReportTravellerForm)
  travellerForms: ReportTravellerForm[];
}

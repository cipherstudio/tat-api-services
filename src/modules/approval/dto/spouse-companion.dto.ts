import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

/** ข้อมูลเสริมคู่สมรส (สอดคล้อง tat-frontend SpouseCompanionData / PATCH หลังอัปโหลดไฟล์) */
export class SpouseCompanionDto {
  @ApiProperty({ required: false, description: 'คู่สมรสเป็น พนง./ลจ. ททท.' })
  @IsOptional()
  @IsBoolean()
  isTatEmployee?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tatEmployeeCode?: string;

  @ApiProperty({
    required: false,
    description: 'ตำแหน่งคู่สมรส (ข้อความ)',
  })
  @IsOptional()
  @IsString()
  spousePositionText?: string;

  @ApiProperty({
    required: false,
    description: 'ระดับคู่สมรส (ข้อความ)',
  })
  @IsOptional()
  @IsString()
  spouseLevelText?: string;

  @ApiProperty({
    required: false,
    example: 'with_officer',
    description: 'รูปแบบการเดินทางของคู่สมรส',
  })
  @IsOptional()
  @IsString()
  travelPattern?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  leaveOrderNo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  leaveOrderSubject?: string;

  @ApiProperty({ required: false, description: 'วันที่มีผล (ISO date)' })
  @IsOptional()
  @IsString()
  leaveOrderEffectiveDate?: string;

  @ApiProperty({ required: false, description: 'รหัสไฟล์หลังอัปโหลด (files.id)' })
  @IsOptional()
  @IsNumber()
  leaveOrderFileId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  leaveOrderFileName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  followTravelDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

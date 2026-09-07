import { ApiProperty } from '@nestjs/swagger';

/**
 * อัตราเบี้ยเลี้ยงฝึกอบรม / ประชุม ของรายงานการเดินทาง
 *
 * โครงเหมือน PerDiemRates ทุกอย่าง ต่างกันที่มี rateType เพื่อให้ตั้งอัตรา
 * ของฝึกอบรมกับประชุมต่างกันได้ — แยกจากเบี้ยเลี้ยงเดินทาง (per_diem_rates)
 * ที่ขออนุมัติเดินทางใช้อยู่
 */
export class TrainingMeetingPerDiemRates {
  @ApiProperty({ description: 'The unique identifier' })
  id: number;

  @ApiProperty({ description: 'Rate type (TRAINING / MEETING)' })
  rateType: 'TRAINING' | 'MEETING';

  @ApiProperty({ description: 'Position group' })
  positionGroup: string;

  @ApiProperty({ description: 'Position name' })
  positionName: string;

  @ApiProperty({ description: 'Level code start' })
  levelCodeStart: string;

  @ApiProperty({ description: 'Level code end' })
  levelCodeEnd: string;

  @ApiProperty({ description: 'Area type (IN / OUT / ABROAD)' })
  areaType: 'IN' | 'OUT' | 'ABROAD';

  @ApiProperty({ description: 'Per diem standard rate' })
  perDiemStandard: number;

  @ApiProperty({ description: 'Is per diem editable' })
  isEditablePerDiem: boolean;

  @ApiProperty({ description: 'Maximum per diem rate' })
  maxPerDiem: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const trainingMeetingPerDiemRatesColumnMap = {
  id: 'id',
  rateType: 'rate_type',
  positionGroup: 'position_group',
  positionName: 'position_name',
  levelCodeStart: 'level_code_start',
  levelCodeEnd: 'level_code_end',
  areaType: 'area_type',
  perDiemStandard: 'per_diem_standard',
  isEditablePerDiem: 'is_editable_per_diem',
  maxPerDiem: 'max_per_diem',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

export const trainingMeetingPerDiemRatesReverseColumnMap = {
  id: 'id',
  rate_type: 'rateType',
  position_group: 'positionGroup',
  position_name: 'positionName',
  level_code_start: 'levelCodeStart',
  level_code_end: 'levelCodeEnd',
  area_type: 'areaType',
  per_diem_standard: 'perDiemStandard',
  is_editable_per_diem: 'isEditablePerDiem',
  max_per_diem: 'maxPerDiem',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

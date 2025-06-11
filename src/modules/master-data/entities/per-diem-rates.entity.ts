import { ApiProperty } from '@nestjs/swagger';

export class PerDiemRates {
  @ApiProperty({ description: 'The unique identifier' })
  id: number;

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

export const perDiemRatesColumnMap = {
  id: 'id',
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

export const perDiemRatesReverseColumnMap = {
  id: 'id',
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
import { ApiProperty } from '@nestjs/swagger';

export class EntertainmentAllowance {
  @ApiProperty({ description: 'ID' })
  id: number;

  @ApiProperty({ description: 'ชื่อกลุ่ม/ตำแหน่ง' })
  title: string;

  @ApiProperty({ description: 'จำนวนวันขั้นต่ำ' })
  minDays: number;

  @ApiProperty({ description: 'จำนวนวันสูงสุด' })
  maxDays: number;

  @ApiProperty({ description: 'จำนวนเงิน' })
  amount: number;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'สิทธิ์ที่ได้รับ' })
  levels?: EntertainmentAllowanceLevel[];
}

export class EntertainmentAllowanceLevel {
  @ApiProperty({ description: 'ID' })
  id: number;

  @ApiProperty({ description: 'FK: entertainment_allowances.id' })
  allowanceId: number;

  @ApiProperty({ description: 'รหัสสิทธิ์' })
  privilegeId: number;

  @ApiProperty({ description: 'ชื่อสิทธิ์' })
  privilegeName: string;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

export const entertainmentAllowanceColumnMap = {
  id: 'id',
  title: 'title',
  minDays: 'min_days',
  maxDays: 'max_days',
  amount: 'amount',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

export const entertainmentAllowanceReverseColumnMap = {
  id: 'id',
  title: 'title',
  min_days: 'minDays',
  max_days: 'maxDays',
  amount: 'amount',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

export const entertainmentAllowanceLevelColumnMap = {
  id: 'id',
  allowanceId: 'allowance_id',
  privilegeId: 'privilege_id',
  privilegeName: 'privilege_name',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

export const entertainmentAllowanceLevelReverseColumnMap = {
  id: 'id',
  allowance_id: 'allowanceId',
  privilege_id: 'privilegeId',
  privilege_name: 'privilegeName',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

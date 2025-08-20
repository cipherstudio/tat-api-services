import {
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStaffMemberCancelledDto {
  @ApiProperty({
    description: 'รหัสพนักงาน',
    example: '66019',
  })
  @IsString()
  employeeCode: string;

  @ApiProperty({
    description: 'สถานะการยกเลิก',
    example: true,
  })
  @IsBoolean()
  cancelled: boolean;
}

export class UpdateApprovalStaffMembersDto {
  @ApiProperty({
    description: 'รายการพนักงานที่ต้องการอัปเดตสถานะ',
    type: [UpdateStaffMemberCancelledDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateStaffMemberCancelledDto)
  staffMembers: UpdateStaffMemberCancelledDto[];
}

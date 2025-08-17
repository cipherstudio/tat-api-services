import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AttireDestinationGroupCountry {
  @ApiProperty({ description: 'Country ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Country code (ISO)' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Country name in English' })
  @IsString()
  nameEn: string;

  @ApiProperty({ description: 'Country name in Thai' })
  @IsString()
  nameTh: string;
}

export class AttireDestinationGroups {
  @ApiProperty({ description: 'ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Group code' })
  @IsString()
  groupCode: string;

  @ApiProperty({ description: 'Group name' })
  @IsString()
  groupName: string;

  @ApiProperty({
    description: 'Assignment type',
    enum: ['TEMPORARY', 'PERMANENT'],
  })
  @IsEnum(['TEMPORARY', 'PERMANENT'])
  assignmentType: 'TEMPORARY' | 'PERMANENT';

  @ApiProperty({ description: 'Description', required: false })
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Countries in this group', type: [AttireDestinationGroupCountry] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttireDestinationGroupCountry)
  countries: AttireDestinationGroupCountry[];

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

// Snake case to camel case mapping for database results
export const attireDestinationGroupsColumnMap = {
  id: 'id',
  group_code: 'groupCode',
  group_name: 'groupName',
  assignment_type: 'assignmentType',
  description: 'description',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

// Camel case to snake case mapping for database inserts
export const attireDestinationGroupsReverseColumnMap = {
  id: 'id',
  groupCode: 'group_code',
  groupName: 'group_name',
  assignmentType: 'assignment_type',
  description: 'description',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
}; 
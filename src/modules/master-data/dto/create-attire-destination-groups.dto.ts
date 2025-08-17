import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateAttireDestinationGroupsDto {
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
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Array of country IDs to associate with this group',
    type: [Number],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  countryIds?: number[];
} 
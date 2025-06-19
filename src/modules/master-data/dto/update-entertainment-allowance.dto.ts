import { PartialType, ApiProperty } from '@nestjs/swagger';
import {
  CreateEntertainmentAllowanceDto,
  CreateEntertainmentAllowanceLevelDto,
} from './create-entertainment-allowance.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateEntertainmentAllowanceLevelDto extends CreateEntertainmentAllowanceLevelDto {}

export class UpdateEntertainmentAllowanceDto extends PartialType(
  CreateEntertainmentAllowanceDto,
) {
  @ApiProperty({
    description: 'ระดับตำแหน่งที่ได้รับสิทธิ์',
    type: [UpdateEntertainmentAllowanceLevelDto],
    required: false,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateEntertainmentAllowanceLevelDto)
  levels?: UpdateEntertainmentAllowanceLevelDto[];
}

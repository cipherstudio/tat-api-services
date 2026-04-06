import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PwJobSpouseAccompanyLeaveCheckResponseDto {
  @ApiProperty()
  found: boolean;

  @ApiProperty()
  employeeCodeInput: string;

  @ApiProperty()
  emplidUsedForQuery: string;

  @ApiPropertyOptional()
  effdt?: string;

  @ApiPropertyOptional()
  effectiveDate?: string;

  @ApiPropertyOptional()
  effseq?: number;

  @ApiPropertyOptional()
  action?: string;

  @ApiPropertyOptional()
  action_reason?: string;

  @ApiPropertyOptional()
  xOrderNo?: string;
}

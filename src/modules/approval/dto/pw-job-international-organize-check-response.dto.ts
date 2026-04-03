import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PwJobInternationalOrganizeCheckResponseDto {
  @ApiProperty()
  employeeCodeInput: string;

  @ApiProperty()
  emplidUsedForQuery: string;

  @ApiProperty()
  hasInternationalOrganize: boolean;

  @ApiPropertyOptional()
  pwJobRowCount?: number;
}

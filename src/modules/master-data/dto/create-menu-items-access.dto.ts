import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateMenuItemsAccessDto {
  @IsString()
  @IsOptional()
  key_name: string;

  @IsString()
  @IsOptional()
  title: string;

  @IsOptional()
  @IsString()
  parent_key?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsNumber()
  is_admin?: boolean;
}

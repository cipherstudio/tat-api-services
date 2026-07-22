import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTrainingCountryDto {
  @IsString() @IsNotEmpty() code: string;
  @IsString() @IsNotEmpty() nameEn: string;
  @IsString() @IsNotEmpty() nameTh: string;
  @IsString() @IsOptional() type?: string | null;
  @IsNumber() @IsOptional() percentIncrease?: number;
}

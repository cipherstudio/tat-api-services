import { IsString, MinLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Reset token',
    example: 'abc123',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'New password',
    example: 'StrongP@ssw0rd',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

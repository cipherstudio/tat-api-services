import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, Matches } from 'class-validator';

export class LdapLoginDto {
  @ApiProperty({
    description:
      'อีเมลสำหรับการยืนยันตัวตนผ่าน LDAP (ต้องลงท้ายด้วย @tat.or.th)',
    example: 'john.doe@tat.or.th',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @Matches(/@tat\.or\.th$/, {
    message: 'อีเมลต้องลงท้ายด้วย @tat.or.th',
  })
  email: string;

  @ApiProperty({
    description: 'รหัสผ่านสำหรับการยืนยันตัวตนผ่าน LDAP',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

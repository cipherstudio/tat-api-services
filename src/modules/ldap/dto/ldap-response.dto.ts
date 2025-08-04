import { ApiProperty } from '@nestjs/swagger';

export class LdapUserDto {
  @ApiProperty({
    description: 'ชื่อจริงของผู้ใช้',
    example: 'John',
  })
  givenName?: string;

  @ApiProperty({
    description: 'อีเมลของผู้ใช้',
    example: 'john.doe@tat.or.th',
  })
  mail?: string;

  @ApiProperty({
    description: 'ชื่อที่แสดงของผู้ใช้',
    example: 'John Doe',
  })
  displayName?: string;

  @ApiProperty({
    description: 'แผนก/ฝ่ายของผู้ใช้',
    example: 'IT Department',
  })
  department?: string;

  @ApiProperty({
    description: 'กลุ่มที่ผู้ใช้เป็นสมาชิก',
    example: ['CN=Users,DC=tat,DC=or,DC=th'],
    type: [String],
  })
  memberOf?: string[];
}

export class LdapAuthenticateResponseDto {
  @ApiProperty({
    description: 'ข้อความตอบกลับ',
    example: 'การยืนยันตัวตนสำเร็จ',
  })
  message: string;

  @ApiProperty({
    description: 'ข้อมูลผู้ใช้จาก LDAP',
    type: LdapUserDto,
  })
  user: LdapUserDto;
} 
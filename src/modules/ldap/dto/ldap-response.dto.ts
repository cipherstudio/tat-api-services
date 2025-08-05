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
    description: 'Access token สำหรับเข้าถึง API',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Refresh token สำหรับต่ออายุ access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refresh_token: string;

  @ApiProperty({
    description: 'ข้อมูลผู้ใช้จากฐานข้อมูล',
    example: {
      id: 1,
      email: 'phatthalaphon.ruan@tat.or.th',
      fullName: 'Phatthalaphon Ruangsri',
      role: 'user',
      position: 'Software Developer',
      employeeCode: 'phatthalaphon.ruan',
      isAdmin: false,
    },
  })
  user: {
    id: number;
    email: string;
    fullName: string;
    role: string;
    position: string;
    employeeCode: string;
    isAdmin: boolean;
  };

  @ApiProperty({
    description: 'ข้อมูลผู้ใช้จาก LDAP',
    type: LdapUserDto,
  })
  ldapUser: LdapUserDto;
} 
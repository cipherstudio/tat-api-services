import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LdapService } from './ldap.service';
import { LdapLoginDto } from './dto/ldap-login.dto';
import { LdapAuthenticateResponseDto } from './dto/ldap-response.dto';

@ApiTags('ldap')
@Controller('ldap')
export class LdapController {
  constructor(private readonly ldapService: LdapService) {}

  @Post('authenticate')
  @ApiOperation({
    summary: 'การยืนยันตัวตนผ่าน LDAP',
    description: 'ยืนยันตัวตนผู้ใช้ผ่าน LDAP Server ของ TAT',
  })
  @ApiResponse({
    status: 200,
    description: 'การยืนยันตัวตนสำเร็จ',
    type: LdapAuthenticateResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
  })
  @ApiResponse({
    status: 500,
    description: 'ไม่สามารถเชื่อมต่อกับ LDAP Server ได้',
  })
  async authenticate(@Body() body: LdapLoginDto) {
    console.log('body', body);
    const user = await this.ldapService.authenticate(body.email, body.password);
    return {
      message: 'การยืนยันตัวตนสำเร็จ',
      user,
    };
  }
}

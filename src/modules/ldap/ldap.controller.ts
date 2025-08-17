import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LdapService } from './ldap.service';
import { LdapLoginDto } from './dto/ldap-login.dto';
import { LdapAuthenticateResponseDto } from './dto/ldap-response.dto';
import {
  AuditLogCategory,
  AuditLogStatus,
} from '@modules/auth/entities/audit-log.entity';
import { AuditLogService } from '@modules/auth/services/audit-log.service';
import { RequestWithUser } from '@modules/auth/auth.controller';

@ApiTags('ldap')
@Controller('ldap')
export class LdapController {
  constructor(
    private readonly ldapService: LdapService,
    private readonly auditLogService: AuditLogService,
  ) {}

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
  async authenticate(@Body() body: LdapLoginDto, @Req() req: RequestWithUser) {
    const result = await this.ldapService.authenticate(
      body.email,
      body.password,
    );

    await this.auditLogService.createLog({
      employeeCode: result.user.employeeCode,
      employeeName: result.user.fullName,
      action: 'LDAP_LOGIN',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      status: AuditLogStatus.SUCCESS,
      category: AuditLogCategory.AUTH,
    });
    return result;
  }
}

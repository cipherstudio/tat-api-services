import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Delete,
  Param,
  ParseIntPipe,
  Version,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SessionService } from './services/session.service';
import { AuditLogService } from './services/audit-log.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuditLogStatus, AuditLogCategory } from './entities/audit-log.entity';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from '../users/users.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Employee } from '@modules/dataviews/entities/employee.entity';
import { ViewPosition4ot } from '@modules/dataviews/entities/view-position-4ot.entity';
import { OpLevelSalR } from '@modules/dataviews/entities/op-level-sal-r.entity';
import { OpMasterT } from '@modules/dataviews/entities/op-master-t.entity';
import { EmployeeRepository } from '@modules/dataviews/repositories/employee.repository';

export interface RequestWithUser extends Request {
  user: User &
    (Employee &
      ViewPosition4ot &
      OpLevelSalR &
      OpMasterT & { isAdmin?: number });
}

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly auditLogService: AuditLogService,
    private readonly usersService: UsersService,
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  @Version('1')
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Version('1')
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto, @Req() req: RequestWithUser) {
    const user = req.user;
    const tokens = await this.authService.login(
      user,
      req.headers['user-agent'] as string,
      req.ip,
    );

    await this.auditLogService.createLog({
      employeeCode: user.pmtCode,
      employeeName: user.pmtNameT,
      action: 'LOGIN',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      status: AuditLogStatus.SUCCESS,
      category: AuditLogCategory.AUTH,
    });

    return tokens;
  }

  @Version('1')
  //@UseGuards(JwtAuthGuard)
  @Post('refresh')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed.' })
  async refresh(
    @Body('refreshToken') refreshToken: string,
    // @Req() req: Request,
  ) {
    const session = await this.sessionService.findSessionByToken(refreshToken);
    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.employeeRepository.findByCodeWithPosition4ot(
      session.employeeCode,
    );
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.authService.refreshTokens(user as any);
    await this.sessionService.deactivateSession(session.id);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      // sessionId: newSession.id,
    };
  }

  @Version('1')
  @Post('sso-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'SSO Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({
    schema: {
      properties: { employeeCode: { type: 'string', example: '123456' } },
    },
  })
  async ssoLogin(@Body() body: { employeeCode: string }, @Req() req: Request) {
    const user = await this.employeeRepository.findByCodeWithPosition4ot(
      body.employeeCode,
    );
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.authService.ssoLogin(
      user as any,
      req.headers['user-agent'] as string,
      req.ip,
    );

    await this.auditLogService.createLog({
      employeeCode: user.pmtCode,
      employeeName: user.pmtNameT,
      action: 'SSO_LOGIN',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      status: AuditLogStatus.SUCCESS,
      category: AuditLogCategory.AUTH,
    });

    return tokens;
  }

  @Version('1')
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent.' })
  @ApiBody({
    schema: {
      properties: { email: { type: 'string', example: 'user@example.com' } },
    },
  })
  async forgotPassword(@Body('email') email: string, @Req() req: Request) {
    const user = await this.authService.sendPasswordResetEmail(email);

    await this.auditLogService.createLog({
      employeeCode: user.employeeCode || email, // Use employeeCode if available, otherwise use email
      employeeName: user.fullName || 'Unknown',
      action: 'PASSWORD_RESET_REQUEST',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      status: AuditLogStatus.SUCCESS,
      category: AuditLogCategory.SECURITY,
    });

    return { message: 'Password reset email sent' };
  }

  @Version('1')
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'Password reset successful.' })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req() req: Request,
  ) {
    await this.authService.resetPassword(resetPasswordDto);

    await this.auditLogService.createLog({
      employeeCode: resetPasswordDto.email, // Using email as employeeCode for now
      employeeName: 'Unknown', // Will be updated when user is found
      action: 'PASSWORD_RESET',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      status: AuditLogStatus.SUCCESS,
      category: AuditLogCategory.SECURITY,
    });

    return { message: 'Password reset successful' };
  }

  @Version('1')
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully.' })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;
    await this.authService.changePassword(user.pmtCode, changePasswordDto);

    await this.auditLogService.createLog({
      employeeCode: user.pmtCode,
      employeeName: user.pmtNameT,
      action: 'CHANGE_PASSWORD',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      status: AuditLogStatus.SUCCESS,
      category: AuditLogCategory.SECURITY,
    });

    return { message: 'Password changed successfully' };
  }

  @Version('1')
  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getSessions(@Req() req: RequestWithUser) {
    const user = req.user;
    return this.sessionService.getEmployeeActiveSessions(user.pmtCode);
  }

  @Version('1')
  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Revoke specific session' })
  @ApiResponse({ status: 200, description: 'Session revoked successfully.' })
  async revokeSession(
    @Param('id', ParseIntPipe) sessionId: number,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;
    await this.sessionService.deactivateSession(sessionId);

    await this.auditLogService.createLog({
      employeeCode: user.pmtCode,
      employeeName: user.pmtNameT,
      action: 'REVOKE_SESSION',
      details: { sessionId },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      status: AuditLogStatus.SUCCESS,
      category: AuditLogCategory.SECURITY,
    });

    return { message: 'Session revoked successfully' };
  }

  @Version('1')
  @UseGuards(JwtAuthGuard)
  @Delete('sessions')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Revoke all sessions' })
  @ApiResponse({
    status: 200,
    description: 'All sessions revoked successfully.',
  })
  async revokeAllSessions(@Req() req: RequestWithUser) {
    const user = req.user;
    await this.sessionService.deactivateAllEmployeeSessions(user.pmtCode);

    await this.auditLogService.createLog({
      employeeCode: user.pmtCode,
      employeeName: user.pmtNameT,
      action: 'REVOKE_ALL_SESSIONS',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      status: AuditLogStatus.SUCCESS,
      category: AuditLogCategory.SECURITY,
    });

    return { message: 'All sessions revoked successfully' };
  }

  @Version('1')
  @UseGuards(JwtAuthGuard)
  @Get('security-events')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get security events' })
  @ApiResponse({ status: 200, description: 'Security events retrieved.' })
  async getSecurityEvents(
    @Req() req: RequestWithUser,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const user = req.user;
    return this.auditLogService.getSecurityEvents(user.pmtCode, page, limit);
  }

  @Version('1')
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Returns the user profile.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProfile(@Req() req) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    return this.usersService.getMe(req.user.id);
  }

  @Version('1')
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async logout(@Req() req) {
    return this.authService.logout(req.user.id);
  }
}

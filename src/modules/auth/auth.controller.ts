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

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly auditLogService: AuditLogService,
    private readonly usersService: UsersService,
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
    const tokens = await this.authService.login(user);
    const session = await this.sessionService.createSession(
      user.id,
      tokens?.refresh_token || '',
      req.headers['user-agent'] as string,
      req.ip,
    );

    await this.auditLogService.createLog({
      userId: user.id,
      action: 'LOGIN',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      status: AuditLogStatus.SUCCESS,
      category: AuditLogCategory.AUTH,
    });

    return { ...tokens, sessionId: session.id };
  }

  @Version('1')
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({
    schema: {
      properties: { refreshToken: { type: 'string', example: '...' } },
    },
  })
  async refresh(
    @Body('refreshToken') refreshToken: string,
    @Req() req: Request,
  ) {
    const session = await this.sessionService.getSessionByToken(refreshToken);
    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const tokens = await this.authService.refreshTokens(session.userId);
    await this.sessionService.deactivateSession(session.id);
    const newSession = await this.sessionService.createSession(
      session.userId,
      tokens.refreshToken,
      req.headers['user-agent'] as string,
      req.ip,
    );
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      sessionId: newSession.id,
    };
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
      userId: user.id,
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
    const user = await this.usersService.findByEmail(resetPasswordDto.email);

    await this.auditLogService.createLog({
      userId: user.id,
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
    await this.authService.changePassword(user.id, changePasswordDto);

    await this.auditLogService.createLog({
      userId: user.id,
      action: 'PASSWORD_CHANGE',
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
    return this.sessionService.getUserActiveSessions(user.id);
  }

  @Version('1')
  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  async revokeSession(
    @Param('id', ParseIntPipe) sessionId: number,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;
    await this.sessionService.deactivateSession(sessionId);

    await this.auditLogService.createLog({
      userId: user.id,
      action: 'SESSION_REVOKE',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      details: { sessionId },
      status: AuditLogStatus.SUCCESS,
      category: AuditLogCategory.SECURITY,
    });

    return { message: 'Session revoked successfully' };
  }

  @Version('1')
  @UseGuards(JwtAuthGuard)
  @Delete('sessions')
  async revokeAllSessions(@Req() req: RequestWithUser) {
    const user = req.user;
    await this.sessionService.deactivateAllUserSessions(user.id);

    await this.auditLogService.createLog({
      userId: user.id,
      action: 'ALL_SESSIONS_REVOKE',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      details: { allSessions: true },
      status: AuditLogStatus.SUCCESS,
      category: AuditLogCategory.SECURITY,
    });

    return { message: 'All sessions revoked successfully' };
  }

  @Version('1')
  @UseGuards(JwtAuthGuard)
  @Get('security-events')
  @ApiOperation({ summary: 'Get security events with pagination' })
  @ApiResponse({ status: 200, description: 'Returns security events.' })
  async getSecurityEvents(
    @Req() req: RequestWithUser,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const user = req.user;
    return this.auditLogService.getSecurityEvents(user.id, page, limit);
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
    return req.user;
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

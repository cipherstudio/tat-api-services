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
import { AuditLogType } from './entities/audit-log.entity';
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
} from '@nestjs/swagger';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('auth')
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
  async login(@Body() loginDto: LoginDto, @Req() req: RequestWithUser) {
    const user = req.user;
    const tokens = await this.authService.login(user);
    const session = await this.sessionService.createSession(
      user.id,
      tokens.refresh_token,
      req,
    );
    await this.auditLogService.log(user.id, AuditLogType.LOGIN, req, true);
    return { ...tokens, sessionId: session.id };
  }

  @Version('1')
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(
    @Body('refreshToken') refreshToken: string,
    @Req() req: Request,
  ) {
    const session =
      await this.sessionService.findSessionByRefreshToken(refreshToken);
    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const tokens = await this.authService.refreshTokens(session.userId);
    await this.sessionService.deactivateSession(session.id);
    const newSession = await this.sessionService.createSession(
      session.userId,
      tokens.refreshToken,
      req,
    );
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      sessionId: newSession.id,
    };
  }

  @Version('1')
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string, @Req() req: Request) {
    const user = await this.authService.sendPasswordResetEmail(email);
    await this.auditLogService.log(
      user.id,
      AuditLogType.PASSWORD_RESET,
      req,
      true,
    );
    return { message: 'Password reset email sent' };
  }

  @Version('1')
  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req() req: Request,
  ) {
    await this.authService.resetPassword(resetPasswordDto);
    const user = await this.usersService.findByEmail(resetPasswordDto.email);
    await this.auditLogService.log(
      user.id,
      AuditLogType.PASSWORD_RESET,
      req,
      true,
    );
    return { message: 'Password reset successful' };
  }

  @Version('1')
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;
    await this.authService.changePassword(user.id, changePasswordDto);
    await this.auditLogService.log(
      user.id,
      AuditLogType.PASSWORD_CHANGE,
      req,
      true,
    );
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
    await this.auditLogService.log(
      user.id,
      AuditLogType.SESSION_REVOKE,
      req,
      true,
      { sessionId },
    );
    return { message: 'Session revoked successfully' };
  }

  @Version('1')
  @UseGuards(JwtAuthGuard)
  @Delete('sessions')
  async revokeAllSessions(@Req() req: RequestWithUser) {
    const user = req.user;
    await this.sessionService.deactivateAllUserSessions(user.id);
    await this.auditLogService.log(
      user.id,
      AuditLogType.SESSION_REVOKE,
      req,
      true,
      { allSessions: true },
    );
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

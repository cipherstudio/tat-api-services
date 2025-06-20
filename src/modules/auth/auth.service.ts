import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { OpLevelSalR } from '@modules/dataviews/entities/op-level-sal-r.entity';
import { ViewPosition4ot } from '@modules/dataviews/entities/view-position-4ot.entity';
import { Employee } from '@modules/dataviews/entities/employee.entity';
import { OpMasterT } from '@modules/dataviews/entities/op-master-t.entity';

interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  type?: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async refreshTokens(userId: number): Promise<TokenResponse> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      }),
    };
  }

  async sendPasswordResetEmail(email: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate and save reset token logic here
    const resetToken = Math.random().toString(36).slice(-8);
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const hashedResetToken = await bcrypt.hash(resetToken, 10);

    await this.usersService.update(user.id, {
      passwordResetToken: hashedResetToken,
      passwordResetExpires: resetTokenExpiry,
    });

    // TODO: Implement actual email sending logic
    return user;
  }

  async logout(userId: number): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.usersService.update(userId, {
      refreshToken: null,
    });
  }

  async validateUser(
    email: string,
    pass: string,
  ): Promise<
    (User & (Employee & ViewPosition4ot & OpLevelSalR & OpMasterT)) | null
  > {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: unused, ...result } = user;
      return result as User &
        (Employee & ViewPosition4ot & OpLevelSalR & OpMasterT);
    }
    return null;
  }

  async login(
    user: User & (Employee & ViewPosition4ot & OpLevelSalR & OpMasterT),
  ) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      }),
      user: {
        id: user.id,
        email: user.pmtEmailAddr,
        fullName: user.pmtNameT,
        role: user.role,
        position: user.posPositionname,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: unused, ...result } = user;
    return result;
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.usersService.update(userId, { password: hashedPassword });
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate password reset token
    const resetToken = Math.random().toString(36).slice(-8);
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Hash the reset token
    const hashedResetToken = await bcrypt.hash(resetToken, 10);

    // Save the reset token and expiry
    await this.usersService.update(user.id, {
      passwordResetToken: hashedResetToken,
      passwordResetExpires: resetTokenExpiry,
    });

    // In a real application, send the reset token via email
    return { message: 'Password reset instructions sent to email' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(resetPasswordDto.email);
    if (!user || !user.passwordResetToken || !user.passwordResetExpires) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if the reset token has expired
    if (user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Verify the reset token
    const isTokenValid = await bcrypt.compare(
      resetPasswordDto.token,
      user.passwordResetToken,
    );
    if (!isTokenValid) {
      throw new BadRequestException('Invalid reset token');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    // Update the user's password and clear reset token fields
    await this.usersService.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    return { message: 'Password reset successful' };
  }
}

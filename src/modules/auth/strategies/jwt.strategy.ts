import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
// import { UsersService } from '../../users/users.service';
import { EmployeeRepository } from '@modules/dataviews/repositories/employee.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly employeeRepository: EmployeeRepository,
    // private readonly usersService: UsersService,
  ) {
    const jwtSecret = configService.get('JWT_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: { sub: number; email: string }) {
    try {
      const user = await this.employeeRepository.findByCodeWithPosition4ot(
        payload.sub.toString(),
      );

      if (!user) {
        throw new UnauthorizedException();
      }

      const datauser = {
        employee: user,
      };

      return datauser;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}

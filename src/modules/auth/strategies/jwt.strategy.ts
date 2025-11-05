import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { expressJwtSecret } from 'jwks-rsa';
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
    const jwksUri = configService.get('JWT_JWKS_URI');
        
    const algorithms: ('RS256' | 'HS256')[] = jwksUri
      ? ['RS256', 'HS256']
      : ['HS256'];
    
    let secretOrKey: string | ReturnType<typeof expressJwtSecret>;
    
    if (jwksUri) {
      secretOrKey = expressJwtSecret({
        jwksUri: jwksUri,
        cache: true,
        cacheMaxAge: 86400000, // 24 hours
        rateLimit: true,
        jwksRequestsPerMinute: 10,
      }) as any;
    } else {
      secretOrKey = jwtSecret;
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretOrKey as any,
      algorithms: algorithms,
    });
  }

  async validate(payload: { sub: string | number; email: string; employeeCode?: string }) {
    try {
      const subStr = payload.sub?.toString() || '';
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subStr) || 
                     /^[A-Za-z0-9_-]{20,}$/.test(subStr);
      
      let employeeCode: string | undefined;
      
      if (payload.employeeCode) {
        employeeCode = payload.employeeCode.toString();
      } else if (!isUUID && subStr) {
        employeeCode = subStr;
      } else if (payload.email) {
        const userByEmail = await this.employeeRepository.findByEmailWithPosition4ot(
          payload.email,
        );
        if (userByEmail) {
          employeeCode = (userByEmail as any).pmtCode?.toString() || (userByEmail as any).code?.toString();
        }
      }
      
      if (!employeeCode) {
        throw new UnauthorizedException('Unable to resolve employee code from token');
      }
      
      const user = await this.employeeRepository.findByCodeWithPosition4ot(
        employeeCode,
      );

      if (!user) {
        throw new UnauthorizedException(`Employee not found: ${employeeCode}`);
      }

      return {
        employee: user,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(`Authentication failed: ${error.message}`);
    }
  }
}

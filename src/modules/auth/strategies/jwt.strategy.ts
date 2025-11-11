import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';
// import { UsersService } from '../../users/users.service';
import { EmployeeRepository } from '@modules/dataviews/repositories/employee.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

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
    
    // Create JWKS provider once if JWKS URI is available
    const jwksSecretProvider = jwksUri ? passportJwtSecret({
      jwksUri: jwksUri,
      cache: true,
      cacheMaxAge: 86400000, // 24 hours
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    }) : null;
    
    // Build options object before calling super()
    const strategyOptions: any = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: algorithms,
    };
    
    strategyOptions.secretOrKeyProvider = (req: any, rawJwtToken: string, done: any) => {
      try {
        const header = JSON.parse(Buffer.from(rawJwtToken.split('.')[0], 'base64').toString());
        
        if (header.alg === 'RS256' && jwksSecretProvider) {
          jwksSecretProvider(req, rawJwtToken, done);
        } else if (header.alg === 'HS256') {
          done(null, jwtSecret);
        } else {
          done(new Error(`Unsupported algorithm: ${header.alg}${header.alg === 'RS256' && !jwksUri ? ' (JWKS URI not configured)' : ''}`), null);
        }
      } catch (err) {
        done(null, jwtSecret);
      }
    };
    
    super(strategyOptions);
    
    // Log after super() call
    this.logger.log(`[JWT Strategy] Config - JWT_SECRET: ${jwtSecret ? 'SET' : 'NOT SET'}`);
    this.logger.log(`[JWT Strategy] Config - JWT_JWKS_URI: ${jwksUri || 'NOT SET'}`);
    this.logger.log(`[JWT Strategy] Algorithms: ${algorithms.join(', ')}`);
    if (jwksUri) {
      this.logger.log(`[JWT Strategy] Using JWKS endpoint: ${jwksUri}`);
    } else {
      this.logger.log(`[JWT Strategy] Using JWT_SECRET for HS256`);
    }
    this.logger.log(`[JWT Strategy] Initialized successfully`);
  }

  async validate(payload: { sub: string | number; email: string; employeeCode?: string }) {
    try {
      this.logger.log(`[JWT Validate] Token verified! Payload: ${JSON.stringify(payload)}`);
      
      const subStr = payload.sub?.toString() || '';
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subStr) || 
                     /^[A-Za-z0-9_-]{20,}$/.test(subStr);
      
      this.logger.log(`[JWT Validate] Sub: ${subStr}, IsUUID: ${isUUID}`);
      
      let employeeCode: string | undefined;
      
      if (payload.employeeCode) {
        employeeCode = payload.employeeCode.toString();
        this.logger.log(`[JWT Validate] Using employeeCode from payload: ${employeeCode}`);
      } else if (!isUUID && subStr) {
        employeeCode = subStr;
        this.logger.log(`[JWT Validate] Using sub as employeeCode: ${employeeCode}`);
      } else if (payload.email) {
        this.logger.log(`[JWT Validate] Looking up employee by email: ${payload.email}`);
        const userByEmail = await this.employeeRepository.findByEmailWithPosition4ot(
          payload.email,
        );
        if (userByEmail) {
          employeeCode = (userByEmail as any).pmtCode?.toString() || (userByEmail as any).code?.toString();
          this.logger.log(`[JWT Validate] Found employee by email - code: ${employeeCode}`);
        } else {
          this.logger.warn(`[JWT Validate] Employee not found by email: ${payload.email}`);
        }
      }
      
      if (!employeeCode) {
        this.logger.error(`[JWT Validate] Unable to resolve employee code`);
        throw new UnauthorizedException('Unable to resolve employee code from token');
      }
      
      this.logger.log(`[JWT Validate] Looking up employee with code: ${employeeCode}`);
      const user = await this.employeeRepository.findByCodeWithPosition4ot(
        employeeCode,
      );

      if (!user) {
        this.logger.error(`[JWT Validate] Employee not found with code: ${employeeCode}`);
        throw new UnauthorizedException(`Employee not found: ${employeeCode}`);
      }

      this.logger.log(`[JWT Validate] Employee found successfully - code: ${employeeCode}`);
      return {
        employee: user,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.logger.error(`[JWT Validate] Unauthorized: ${error.message}`);
        throw error;
      }
      this.logger.error(`[JWT Validate] Error: ${error.message}`, error.stack);
      throw new UnauthorizedException(`Authentication failed: ${error.message}`);
    }
  }
}

import { Injectable, Logger, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;
    
    this.logger.log(`[JWT Guard] Request - Path: ${request.path}, Method: ${request.method}`);
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      this.logger.log(`[JWT Guard] Token received (length: ${token?.length || 0})`);
    } else {
      this.logger.warn(`[JWT Guard] No authorization header`);
    }
    
    try {
      this.logger.log(`[JWT Guard] Calling super.canActivate...`);
      const result = super.canActivate(context);
      this.logger.log(`[JWT Guard] super.canActivate called, waiting for result...`);
      const resolved = await result;
      this.logger.log(`[JWT Guard] super.canActivate resolved: ${resolved}`);
      return resolved as boolean;
    } catch (error) {
      this.logger.error(`[JWT Guard] super.canActivate rejected: ${error.message}`);
      throw error;
    }
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    this.logger.log(`[JWT Guard] handleRequest - err: ${err ? 'yes' : 'no'}, user: ${user ? 'yes' : 'no'}, info: ${info ? info.message : 'no'}`);
    
    if (err) {
      this.logger.error(`[JWT Guard] Error: ${err.message}`);
    }
    
    if (info) {
      this.logger.warn(`[JWT Guard] Info: ${info.message || JSON.stringify(info)}`);
    }
    
    if (!user) {
      throw err || new UnauthorizedException(info?.message || 'Authentication failed');
    }
    
    return user;
  }
}

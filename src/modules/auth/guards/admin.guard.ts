import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';

/**
 * Restricts a route to admin users.
 *
 * Must run AFTER JwtAuthGuard (which populates req.user). It reads the admin
 * flag resolved in JwtStrategy.validate (from the employee_admin table), so the
 * guard itself has no dependencies and can be applied on any controller/handler
 * without extra module wiring.
 *
 * Usage:
 *   - whole controller:  @UseGuards(JwtAuthGuard, AdminGuard)
 *   - single handler:    @UseGuards(AdminGuard)   // when class already has JwtAuthGuard
 */
@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const isAdmin = user?.isAdmin === true || user?.role === 'admin';

    if (!isAdmin) {
      this.logger.warn(
        `[Admin Guard] Denied - path: ${request.path}, method: ${request.method}, role: ${user?.role ?? 'unknown'}`,
      );
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}

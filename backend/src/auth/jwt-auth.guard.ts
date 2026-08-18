import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClinicRole, Role } from '@prisma/client';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (typeof authHeader !== 'string') {
      throw new UnauthorizedException('Authentication required');
    }

    const [scheme, token, ...extra] = authHeader.trim().split(/\s+/);
    if (scheme?.toLowerCase() !== 'bearer' || !token || extra.length > 0) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    try {
      const payload = this.jwtService.verify(token);
      const userId = Number(payload?.userId);
      const role = payload?.role;
      if (!Number.isInteger(userId) || userId <= 0 || !Object.values(Role).includes(role)) {
        throw new UnauthorizedException('Invalid token payload');
      }

      if (payload.clinicId !== undefined && payload.clinicId !== null) {
        const clinicId = Number(payload.clinicId);
        if (!Number.isInteger(clinicId) || clinicId <= 0) {
          throw new UnauthorizedException('Invalid token clinic context');
        }
        payload.clinicId = clinicId;
        if (payload.clinicRole !== undefined && payload.clinicRole !== null && !Object.values(ClinicRole).includes(payload.clinicRole)) {
          throw new UnauthorizedException('Invalid token clinic role');
        }
      }

      payload.userId = userId;
      request.user = payload;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

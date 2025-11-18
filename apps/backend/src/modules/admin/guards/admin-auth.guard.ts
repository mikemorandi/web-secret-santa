import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminPasswordHash) {
      throw new UnauthorizedException('Admin password not configured');
    }

    // Check for password hash in Authorization header (Bearer token format)
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header provided');
    }

    const [type, passwordHash] = authHeader.split(' ');
    if (type !== 'Bearer' || passwordHash !== adminPasswordHash) {
      throw new UnauthorizedException('Invalid admin password');
    }

    return true;
  }
}

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      throw new UnauthorizedException('Admin password not configured');
    }

    // Check for password in Authorization header (Bearer token format)
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header provided');
    }

    const [type, password] = authHeader.split(' ');
    if (type !== 'Bearer' || password !== adminPassword) {
      throw new UnauthorizedException('Invalid admin password');
    }

    return true;
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const header = req.headers?.authorization as string | undefined;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token manquant');
    }
    try {
      const payload = this.jwtService.verify<{ role?: string }>(header.slice(7));
      if (payload.role !== 'admin') {
        throw new UnauthorizedException('Accès réservé aux administrateurs');
      }
      req.admin = payload;
      return true;
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }
}

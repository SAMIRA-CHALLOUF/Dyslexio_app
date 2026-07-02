import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const header = req.headers?.authorization as string | undefined;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token manquant');
    }
    try {
      req.user = this.jwtService.verify(header.slice(7));
      return true;
    } catch {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }
}

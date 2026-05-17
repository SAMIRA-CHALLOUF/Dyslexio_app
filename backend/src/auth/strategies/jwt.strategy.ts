import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'Logopédie_SECRET_2026_CHANGE_ME_IN_PRODUCTION',
    });
  }

  async validate(payload: any) {
    // This return value is attached to req.user in every guarded route
    return {
      sub:        payload.sub,
      email:      payload.email,
      nom:        payload.nom,
      prenom:     payload.prenom,
      typeCompte: payload.typeCompte,
    };
  }
}
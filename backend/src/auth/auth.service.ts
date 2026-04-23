import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Eleve } from '../eleve/eleve.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Eleve)
    private eleveRepository: Repository<Eleve>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, motDePasse: string) {
    const user = await this.eleveRepository.findOne({ 
      where: { email },
      select: ['id', 'nom', 'prenom', 'email', 'motDePasse', 'image', 'typeCompte']
    });

    if (!user) {
      throw new UnauthorizedException("Cet email n'existe pas");
    }

    const isPasswordValid = await bcrypt.compare(motDePasse, user.motDePasse);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    // Générer le token JWT
    const payload = { 
      sub: user.id, 
      email: user.email,
      prenom: user.prenom,
      nom: user.nom,
      typeCompte: user.typeCompte
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        image: user.image,
        typeCompte: user.typeCompte,
      }
    };
  }
}
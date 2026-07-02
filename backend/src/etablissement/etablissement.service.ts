import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Etablissement } from './etablissement.entity';
import { CreateEtablissementDto } from './dto/create-etablissement.dto';
import { UpdateEtablissementDto } from './dto/update-etablissement.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { MailerService } from '../shared/services/mailer.service';

@Injectable()
export class EtablissementService {
  constructor(
    @InjectRepository(Etablissement)
    private readonly etablissementRepository: Repository<Etablissement>,
    private readonly mailerService: MailerService,
  ) {}

  async create(
    createEtablissementDto: CreateEtablissementDto,
    options: { sendVerificationEmail?: boolean; passwordIsHashed?: boolean } = {},
  ): Promise<Etablissement> {
    const { motDePasse, confirmationMotDePasse, ...rest } = createEtablissementDto as any;
    const passwordIsHashed = !!options.passwordIsHashed;
    const shouldSendEmail = !!options.sendVerificationEmail;

    if (!passwordIsHashed) {
      if (!motDePasse || !confirmationMotDePasse) {
        throw new BadRequestException('Le mot de passe et sa confirmation sont requis');
      }
      if (motDePasse !== confirmationMotDePasse) {
        throw new BadRequestException('Les mots de passe ne correspondent pas');
      }
    } else {
      if (!motDePasse) {
        throw new BadRequestException('Le mot de passe chiffré est requis');
      }
    }

    const hashedPassword = passwordIsHashed ? (motDePasse as any) : await bcrypt.hash(motDePasse, 10);

    const verifyToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const etablissement = this.etablissementRepository.create({
      ...rest,
      motDePasse: hashedPassword,
      verifyToken,
      tokenExpires,
    });

    let savedEntity: Etablissement;
    try {
      const result = await this.etablissementRepository.save(etablissement);
      // `save` can return an entity or an array of entities depending on input;
      // normalize to a single Etablissement instance.
      savedEntity = Array.isArray(result) ? result[0] : (result as Etablissement);
    } catch (err) {
      throw new InternalServerErrorException("Impossible de sauvegarder l'établissement");
    }

    if (shouldSendEmail) {
      try {
        await this.mailerService.sendVerificationEmail(savedEntity.email, verifyToken, savedEntity.prenom);
      } catch (err) {
        // Log the mailer error but do not block the creation flow
        // eslint-disable-next-line no-console
        console.error('Failed to send verification email for etablissement', savedEntity.email, err?.message ?? err);
      }
    }

    return savedEntity;
  }

  findAll() {
    return this.etablissementRepository.find();
  }

  findOne(id: number) {
    return this.etablissementRepository.findOneBy({ id });
  }

  async update(id: number, updateEtablissementDto: UpdateEtablissementDto) {
    await this.etablissementRepository.update(id, updateEtablissementDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.etablissementRepository.delete(id);
  }
}
// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Client, ClientStatus } from '../client/client.entity';
import { Etablissement } from '../etablissement/etablissement.entity';
import { Eleve } from '../eleve/eleve.entity';
import { PendingRegistrationService } from '../pending/pending-registration.service';
import { PendingAccountType } from '../pending/pending-registration.entity';
import { MailerService } from '../shared/services/mailer.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,

    @InjectRepository(Etablissement)
    private etablissementRepository: Repository<Etablissement>,

    @InjectRepository(Eleve)
    private eleveRepository: Repository<Eleve>,

    private jwtService: JwtService,
    private pendingService: PendingRegistrationService,
    private mailerService: MailerService,
  ) {}

  // ── REGISTER PENDING ────────────────────────────────────
  /**
   * Étape 1 : Sauvegarder les données en attente de paiement.
   * Le vrai compte sera créé après paiement confirmé via webhook Stripe.
   */
  async registerPending(dto: {
    nom: string;
    prenom: string;
    email: string;
    motDePasse: string;
    confirmationMotDePasse: string;
    typeCompte: string;
    billingPeriod?: string;
  }): Promise<{ pendingId: string; message: string }> {
    if (dto.motDePasse !== dto.confirmationMotDePasse) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    const emailLower = dto.email.toLowerCase();

    // Vérifier si l'email existe déjà dans les vrais comptes
    const existingUser = await this.findUserByEmail(emailLower);
    if (existingUser) {
      throw new BadRequestException('Cet email est déjà utilisé');
    }

    const pending = await this.pendingService.createOrReplace({
      nom: dto.nom,
      prenom: dto.prenom,
      email: emailLower,
      motDePasse: dto.motDePasse, // sera hashé dans le service
      typeCompte: dto.typeCompte as PendingAccountType,
      billingPeriod: dto.billingPeriod,
    });

    this.logger.log(`Pending registration created: ${emailLower} (id: ${pending.id})`);

    return {
      pendingId: pending.id,
      message: 'Données enregistrées. Procédez au paiement.',
    };
  }

  // ── FINALISER APRÈS PAIEMENT (appelé par webhook) ───────
  /**
   * Étape 2 : Créer le vrai compte après paiement confirmé.
   * Appelé depuis PaymentService.processWebhookEvent
   */
  async finalizeRegistration(pendingId: string): Promise<{ message: string }> {
    const pending = await this.pendingService.findById(pendingId);
    if (!pending) {
      this.logger.warn(`Pending registration ${pendingId} not found`);
      throw new NotFoundException('Inscription en attente introuvable');
    }

    if (pending.completed) {
      this.logger.warn(`Pending registration ${pendingId} already completed`);
      return { message: 'Paiement déjà confirmé pour cette inscription' };
    }

    // Vérifier que l'email n'est pas déjà pris
    const existingUser = await this.findUserByEmail(pending.email);
    if (existingUser) {
      this.logger.warn(`Email ${pending.email} already registered, skipping`);
      await this.pendingService.markCompleted(pendingId);
      return { message: 'Un compte existe déjà avec cet email' };
    }

    // Marquer pending comme complété (signifie payé et en attente de vérification)
    const wasUpdated = await this.pendingService.markCompleted(pendingId);
    if (!wasUpdated) {
      this.logger.warn(`Pending registration ${pendingId} already completed or concurrently modified`);
      return { message: 'Paiement déjà confirmé pour cette inscription' };
    }

    // Créer le compte réel en base dès la confirmation du paiement.
    // La vérification email servira ensuite à activer le compte.
    await this.createRealAccountFromPending(pending);

    // Envoyer email de vérification (le token est déjà généré dans pending)
    if (pending.verifyToken) {
      await this.mailerService.sendVerificationEmail(
        pending.email,
        pending.verifyToken,
        pending.prenom,
      );
    }

    this.logger.log(`Registration paid and email sent for pending ${pendingId}`);

    return {
      message: 'Paiement confirmé. Email de vérification envoyé.',
    };
  }

  // ── LOGIN ────────────────────────────────────────────────
  async login(email: string, motDePasse: string) {
    const emailLower = email.toLowerCase();
    
    // Check Etablissement
    let user: any = await this.etablissementRepository.findOne({
      where: { email: emailLower },
      select: ['id', 'nom', 'prenom', 'email', 'motDePasse', 'image', 'typeCompte'],
    });

    if (!user) {
      // Check Client
      const client = await this.clientRepository.findOne({
        where: { email: emailLower },
        select: ['id', 'nom', 'prenom', 'email', 'motDePasse', 'image', 'typeCompte', 'status'],
      });

      if (client) {
        if (client.status === ClientStatus.PENDING) {
          throw new UnauthorizedException(
            'Veuillez vérifier votre email avant de vous connecter',
          );
        }
        user = client;
      }
    }
    
    if (!user) {
      const eleve = await this.eleveRepository.findOne({
        where: { email: emailLower },
        select: ['id', 'nom', 'prenom', 'email', 'motDePasse', 'typeCompte'],
      });
      if (eleve) {
        user = eleve;
      }
    }

    if (!user) {
      throw new UnauthorizedException("Cet email n'existe pas");
    }

    const isPasswordValid = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      prenom: user.prenom,
      nom: user.nom,
      typeCompte: user.typeCompte,
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
      },
    };
  }

  // ── FORGOT PASSWORD ─────────────────────────────────────
  async forgotPassword(email: string): Promise<{ message: string }> {
    const emailLower = email.toLowerCase();
    const user = await this.findUserByEmail(emailLower);

    if (!user) {
      return { message: 'Si cet email existe, un lien a été envoyé.' };
    }

    try {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

      (user as any).verifyToken = resetToken;
      (user as any).tokenExpires = resetExpires;

      const repo =
        user instanceof Etablissement
          ? this.etablissementRepository
          : this.clientRepository;
      await (repo as any).save(user);

      await this.mailerService.sendPasswordResetEmail(
        user.email!,
        resetToken,
        user.prenom,
      );

      this.logger.log(`Password reset email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return { message: 'Si cet email existe, un lien a été envoyé.' };
  }

  // ── RESET PASSWORD ──────────────────────────────────────
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    let user: any = await this.etablissementRepository
      .createQueryBuilder('etablissement')
      .where('etablissement.verifyToken = :token', { token })
      .getOne();

    if (!user) {
      user = await this.clientRepository
        .createQueryBuilder('client')
        .where('client.verifyToken = :token', { token })
        .getOne();
    }

    if (!user) {
      throw new NotFoundException('Lien invalide ou déjà utilisé');
    }

    if (user.tokenExpires && new Date() > user.tokenExpires) {
      throw new BadRequestException(
        'Lien expiré, veuillez en demander un nouveau',
      );
    }

    try {
      user.motDePasse = await bcrypt.hash(newPassword, 10);
      user.verifyToken = undefined;
      user.tokenExpires = undefined;

      const repo =
        user instanceof Etablissement
          ? this.etablissementRepository
          : this.clientRepository;
      await (repo as any).save(user);

      this.logger.log(`Password reset successfully for user ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to reset password for token ${token}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerErrorException(
        'Failed to reset password. Please try again.',
      );
    }

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  // ── VERIFY EMAIL ────────────────────────────────────────
  async verifyEmail(token: string): Promise<{ message: string }> {
    const existingActivated = await this.activateAccountByToken(token);
    if (existingActivated) {
      await this.deletePendingByToken(token);
      return {
        message:
          'Email vérifié avec succès. Vous pouvez maintenant vous connecter.',
      };
    }

    // Fallback compatibilité : si le webhook a bien confirmé le paiement mais
    // que le compte n'a pas encore été matérialisé, on le crée maintenant.
    const pending = await this.pendingService.findByVerifyToken(token);
    if (!pending) {
      throw new NotFoundException('Token invalide ou déjà utilisé.');
    }

    if (!pending.completed) {
      throw new BadRequestException('Le paiement n\'a pas encore été confirmé.');
    }

    if (pending.tokenExpires && new Date() > pending.tokenExpires) {
      throw new BadRequestException('Le lien de vérification a expiré.');
    }

    await this.createRealAccountFromPending(pending);

    const activatedAfterCreate = await this.activateAccountByToken(token);
    if (!activatedAfterCreate) {
      throw new InternalServerErrorException('Impossible d\'activer le compte après vérification.');
    }

    await this.pendingService.deleteById(pending.id);

    return {
      message:
        'Email vérifié avec succès. Vous pouvez maintenant vous connecter.',
    };
  }

  // ── HELPER ──────────────────────────────────────────────
  private async findUserByEmail(
    email: string,
  ): Promise<(Client | Etablissement | Eleve) | null> {
    const emailLower = email.toLowerCase();
    let user: any = await this.etablissementRepository.findOne({
      where: { email: emailLower },
    });
    if (user) return user;

    user = await this.clientRepository.findOne({ where: { email: emailLower } });
    if (user) return user;

    user = await this.eleveRepository.findOne({ where: { email: emailLower } });
    return user || null;
  }

  private async createRealAccountFromPending(pending: {
    nom: string;
    prenom: string;
    email: string;
    motDePasse: string;
    typeCompte: string;
    billingPeriod?: string;
    verifyToken?: string;
    tokenExpires?: Date;
  }): Promise<void> {
    const existing = await this.findUserByEmail(pending.email);
    if (existing) {
      return;
    }

    if (pending.typeCompte === 'client') {
      const billing = pending.billingPeriod || 'annual';
      const subscribedAt = new Date();
      const expiresAt = new Date();

      if (billing === 'biannual') {
        expiresAt.setMonth(expiresAt.getMonth() + 6);
      } else if (billing === 'annual') {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else if (billing === 'biennial') {
        expiresAt.setFullYear(expiresAt.getFullYear() + 2);
      }

      const client = this.clientRepository.create({
        nom: pending.nom,
        prenom: pending.prenom,
        email: pending.email,
        motDePasse: pending.motDePasse,
        typeCompte: 'client' as any,
        status: ClientStatus.PENDING,
        billingPeriod: billing as any,
        subscribedAt,
        expiresAt,
        verifyToken: pending.verifyToken,
        tokenExpires: pending.tokenExpires,
      });

      await this.clientRepository.save(client);
      this.logger.log(`Client persisted from pending: ${pending.email}`);
      return;
    }

    if (pending.typeCompte === 'etablissement') {
      const etablissement = this.etablissementRepository.create({
        nom: pending.nom,
        prenom: pending.prenom,
        email: pending.email,
        motDePasse: pending.motDePasse,
        typeCompte: pending.typeCompte as any,
        verifyToken: pending.verifyToken,
        tokenExpires: pending.tokenExpires,
      });

      await this.etablissementRepository.save(etablissement);
      this.logger.log(`Etablissement persisted from pending: ${pending.email}`);
    }
  }

  private async activateAccountByToken(token: string): Promise<boolean> {
    const client = await this.clientRepository
      .createQueryBuilder('client')
      .where('client.verifyToken = :token', { token })
      .getOne();

    if (client) {
      if (client.tokenExpires && new Date() > client.tokenExpires) {
        throw new BadRequestException('Le lien de vérification a expiré.');
      }
      client.status = ClientStatus.ACTIVE;
      client.verifyToken = undefined;
      client.tokenExpires = undefined;
      await this.clientRepository.save(client);
      this.logger.log(`Email verified for client ${client.email}`);
      return true;
    }

    const etablissement = await this.etablissementRepository
      .createQueryBuilder('etablissement')
      .where('etablissement.verifyToken = :token', { token })
      .getOne();

    if (etablissement) {
      if (etablissement.tokenExpires && new Date() > etablissement.tokenExpires) {
        throw new BadRequestException('Le lien de vérification a expiré.');
      }
      (etablissement as any).verifyToken = undefined;
      (etablissement as any).tokenExpires = undefined;
      await this.etablissementRepository.save(etablissement);
      this.logger.log(`Email verified for etablissement ${etablissement.email}`);
      return true;
    }

    return false;
  }

  private async deletePendingByToken(token: string): Promise<void> {
    const pending = await this.pendingService.findByVerifyToken(token);
    if (pending) {
      await this.pendingService.deleteById(pending.id);
    }
  }
}
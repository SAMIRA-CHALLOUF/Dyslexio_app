import {
  Injectable,
  BadRequestException,
  ConflictException,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { BillingPeriod } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { MailerService } from '../shared/services/mailer.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);

  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private mailerService: MailerService,
  ) {}

  async create(createClientDto: CreateClientDto, options?: { sendVerificationEmail?: boolean; passwordIsHashed?: boolean }): Promise<Client> {
    const { motDePasse, confirmationMotDePasse, billingPeriod, ...rest } = createClientDto;
    const shouldSendEmail = options?.sendVerificationEmail ?? false;
    const passwordIsHashed = options?.passwordIsHashed ?? false;

    // Note: email uniqueness is already checked in PendingRegistrationService
    // Only check at actual creation time if bypassing pending flow
    if (!passwordIsHashed) {
      const existingClient = await this.clientRepository.findOne({ where: { email: rest.email } });
      if (existingClient) {
        throw new ConflictException('Un compte existe déjà avec cette adresse email.');
      }
    }

    // --- Validation mot de passe ---
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

    const subscribedAt = new Date();
    const expiresAt = new Date(subscribedAt);

    switch (billingPeriod) {
      case BillingPeriod.BIANNUAL:
        expiresAt.setMonth(expiresAt.getMonth() + 6);
        break;
      case BillingPeriod.ANNUAL:
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        break;
      case BillingPeriod.BIENNIAL:
        expiresAt.setFullYear(expiresAt.getFullYear() + 2);
        break;
      default:
        throw new BadRequestException('Période de facturation invalide');
    }

    // Génération du token de vérification d'email
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const client = this.clientRepository.create({
      ...rest,
      billingPeriod,
      motDePasse: hashedPassword,
      subscribedAt,
      expiresAt,
      verifyToken,
      tokenExpires,
    });

    let savedClient: Client;
    try {
      savedClient = await this.clientRepository.save(client);
    } catch (err) {
      this.logger.error('Failed to save client', err instanceof Error ? err.message : String(err));
      throw new InternalServerErrorException('Impossible de sauvegarder le client');
    }

    // --- Envoi de l'email de vérification (optionnel, par défaut: false) ---
    if (shouldSendEmail) {
      try {
        await this.mailerService.sendVerificationEmail(savedClient.email, verifyToken, savedClient.prenom);
        this.logger.log(`Verification email sent to ${savedClient.email}`);
      } catch (error) {
        this.logger.error(`Failed to send verification email to ${savedClient.email}`,
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    return savedClient;
  }

  /**
   * Send verification email to a client (useful after payment confirmation)
   */
  async sendVerificationEmail(clientId: number): Promise<void> {
    const client = await this.clientRepository.findOneBy({ id: clientId });
    if (!client) {
      throw new NotFoundException(`Client with id ${clientId} not found`);
    }

    try {
      await this.mailerService.sendVerificationEmail(client.email, client.verifyToken!, client.prenom);
      this.logger.log(`Verification email sent to ${client.email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${client.email}`, error instanceof Error ? error.message : String(error));
      throw new InternalServerErrorException('Erreur lors de l\'envoi de l\'email de vérification');
    }
  }


  findAll() {
    return this.clientRepository.find();
  }

  findOne(id: number) {
    return this.clientRepository.findOneBy({ id });
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    await this.clientRepository.update(id, updateClientDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.clientRepository.delete(id);
  }
}
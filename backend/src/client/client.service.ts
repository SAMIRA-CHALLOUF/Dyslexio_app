import {
  Injectable, BadRequestException, ConflictException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client, ClientStatus, BillingPeriod } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  // ── Calcul date expiration selon billing ─────────────────
  private computeExpiresAt(billing: BillingPeriod): Date {
    const d = new Date();
    if (billing === BillingPeriod.BIANNUAL) d.setMonth(d.getMonth() + 6);
    if (billing === BillingPeriod.ANNUAL)   d.setFullYear(d.getFullYear() + 1);
    if (billing === BillingPeriod.BIENNIAL) d.setFullYear(d.getFullYear() + 2);
    return d;
  }

  // ── Envoi email vérification ─────────────────────────────
  private async sendVerificationEmail(prenom: string, email: string, token: string) {
    // ✅ Après
// ✅ valeurs directes pour tester
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'samyrachallouf4@gmail.com',
    pass: 'hoifdoqbhjghswqr',
  },
});

    const url = `${process.env.BACKEND_URL}/client/verify-email?token=${token}`;

    await transporter.sendMail({
      from: '"Dyslexio" <noreply@dyslexio.app>',
      to: email,
      subject: 'Confirmez votre adresse email — Dyslexio',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:40px 32px;
          border-radius:12px;border:1px solid #e2e8f0">
          <h2 style="color:#0D9373">Bienvenue, ${prenom} !</h2>
          <p style="color:#475569;font-size:15px;line-height:1.6">
            Cliquez sur le bouton ci-dessous pour confirmer votre adresse et accéder à l'application.
          </p>
          <div style="text-align:center;margin:32px 0">
            <a href="${url}" style="display:inline-block;padding:14px 32px;
              background:#0D9373;color:#fff;font-size:15px;font-weight:700;
              border-radius:10px;text-decoration:none">
              Vérifier mon adresse
            </a>
          </div>
          <p style="color:#94a3b8;font-size:12px;text-align:center">
            Lien valide 24h · Si vous n'avez pas créé de compte, ignorez cet email.
          </p>
        </div>
      `,
    });
  }

  // ── CREATE ───────────────────────────────────────────────
  async create(dto: CreateClientDto): Promise<{ message: string }> {
    const { motDePasse, confirmationMotDePasse, billingPeriod, ...rest } = dto;

    // 1. Vérification mots de passe
    if (motDePasse !== confirmationMotDePasse) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    // 2. Email déjà utilisé ?
    const exists = await this.clientRepository.findOne({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Cet email est déjà utilisé');

    // 3. Hash mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    // 4. Token vérification (24h)
    const verifyToken  = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 5. Dates abonnement
    const subscribedAt = new Date();
    const expiresAt    = this.computeExpiresAt(billingPeriod);

    // 6. Création entité
    const client = this.clientRepository.create({
      ...rest,
      motDePasse: hashedPassword,
      billingPeriod,
      subscribedAt,
      expiresAt,
      status: ClientStatus.PENDING,
      verifyToken,
      tokenExpires,
    });

    await this.clientRepository.save(client);

    // 7. Envoi email
    await this.sendVerificationEmail(dto.prenom, dto.email, verifyToken);

    return { message: 'Compte créé. Vérifiez votre email.' };
  }

  // ── VERIFY EMAIL ─────────────────────────────────────────
  async verifyEmail(token: string): Promise<string> {
    const client = await this.clientRepository.findOne({
      where: { verifyToken: token, status: ClientStatus.PENDING },
    });

    if (!client) throw new NotFoundException('Lien invalide ou déjà utilisé');

    if (client.tokenExpires && new Date() > client.tokenExpires) {
      throw new BadRequestException('Lien expiré');
    }

    // Activer le compte
    client.status       = ClientStatus.ACTIVE;
    client.verifyToken  = undefined;
    client.tokenExpires = undefined;
    await this.clientRepository.save(client);

    // Retourne l'URL frontend pour la redirection
    return `${process.env.FRONTEND_URL}/signin?verified=true`;
  }

  findAll()             { return this.clientRepository.find(); }
  findOne(id: number)   { return this.clientRepository.findOneBy({ id }); }
  remove(id: number)    { return this.clientRepository.delete(id); }
}
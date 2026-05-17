import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Etablissement } from '../etablissement/etablissement.entity';
import { Client, ClientStatus, BillingPeriod } from '../client/client.entity';
import { Admin } from '../admin/admin.entity'; // Import Admin entity
import { AccountType } from '../etablissement/enums/account-type.enum';
import { RegisterDto } from './register.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin) // Inject Admin repository
    private adminRepository: Repository<Admin>,

    @InjectRepository(Etablissement)
    private etablissementRepository: Repository<Etablissement>,

    @InjectRepository(Client)
    private clientRepository: Repository<Client>,

    private jwtService: JwtService,
  ) {}

  async login(email: string, motDePasse: string) {

    // 1. Chercher dans la table admin
    let user: any = await this.adminRepository.findOne({
      where: { email },
      select: ['id', 'nom', 'email', 'motDePasse'],
    });
    let userType = 'admin';

    // 2. Si pas trouvé → chercher dans la table etablissement
    if (!user) {
      user = await this.etablissementRepository.findOne({
        where: { email },
        select: ['id', 'nom', 'prenom', 'email', 'motDePasse', 'image', 'typeCompte'],
      });
      if (user) {
        userType = user.typeCompte;
      }
    }

    // 3. Si pas trouvé → chercher dans la table client
    if (!user) {
      const client = await this.clientRepository.findOne({
        where: { email },
        select: ['id', 'nom', 'prenom', 'email', 'motDePasse', 'image', 'typeCompte', 'status'],
      });

      if (!client) {
        throw new UnauthorizedException("Cet email n'existe pas");
      }

      // Vérifier si le client a vérifié son email
      if (client.status === ClientStatus.PENDING) {
        throw new UnauthorizedException("Veuillez vérifier votre email avant de vous connecter");
      }

      user = client;
      userType = user.typeCompte;
    }

    // 4. Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    // 5. Générer le token JWT
    const payload = {
      sub: user.id,
      email: user.email,
      prenom: user.prenom, // prenom might not exist for admin
      nom: user.nom,
      typeCompte: userType,
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
        typeCompte: userType,
      },
    };
  }
  async register(dto: RegisterDto): Promise<{ message: string }> {
  // Check for duplicate email in both tables
  const existingEtab = await this.etablissementRepository.findOne({ where: { email: dto.email } });
  const existingClient = await this.clientRepository.findOne({ where: { email: dto.email } });

  if (existingEtab || existingClient) {
    throw new BadRequestException('Cet email est déjà utilisé');
  }

  if (dto.motDePasse !== dto.confirmationMotDePasse) {
    throw new BadRequestException('Les mots de passe ne correspondent pas');
  }

  const hashedPassword = await bcrypt.hash(dto.motDePasse, 10);

  if (dto.typeCompte === AccountType.ETABLISSEMENT) {
    const etab = this.etablissementRepository.create({
      nom: dto.nom,
      prenom: dto.prenom,
      email: dto.email,
      motDePasse: hashedPassword,
      typeCompte: AccountType.ETABLISSEMENT,
    });
    await this.etablissementRepository.save(etab);
    return { message: 'Compte établissement créé avec succès' };

  } else {
    // Generate email verification token
    const verifyToken   = crypto.randomBytes(32).toString('hex');
    const tokenExpires  = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Compute subscription dates based on billing period
    const billing = (dto.billingPeriod ?? BillingPeriod.ANNUAL) as BillingPeriod;
    const subscribedAt = new Date();
    const expiresAt    = new Date(subscribedAt);
    if (billing === BillingPeriod.BIANNUAL) expiresAt.setMonth(expiresAt.getMonth() + 6);
    else if (billing === BillingPeriod.ANNUAL) expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    else if (billing === BillingPeriod.BIENNIAL) expiresAt.setFullYear(expiresAt.getFullYear() + 2);

    const client = this.clientRepository.create({
      nom: dto.nom,
      prenom: dto.prenom,
      email: dto.email,
      motDePasse: hashedPassword,
      typeCompte: AccountType.CLIENT,
      billingPeriod: billing,
      subscribedAt,
      expiresAt,
      status: ClientStatus.PENDING,
      verifyToken,
      tokenExpires,
    });
    await this.clientRepository.save(client);

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: 'samyrachallouf4@gmail.com', pass: 'hoifdoqbhjghswqr' },
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;
    await transporter.sendMail({
      from: '"Dyslexio" <samyrachallouf4@gmail.com>',
      to: dto.email,
      subject: 'Vérifiez votre email — Dyslexio',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:40px 32px;
          border-radius:12px;border:1px solid #e2e8f0">
          <h2 style="color:#0D9373">Vérifiez votre adresse email</h2>
          <p style="color:#475569;font-size:15px;line-height:1.6">
            Cliquez sur le bouton ci-dessous pour activer votre compte.
            Ce lien est valable <strong>24 heures</strong>.
          </p>
          <div style="text-align:center;margin:32px 0">
            <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;
              background:#0D9373;color:#fff;font-size:15px;font-weight:700;
              border-radius:10px;text-decoration:none">
              Vérifier mon email
            </a>
          </div>
        </div>
      `,
    });

    return { message: 'Compte créé. Vérifiez votre email pour activer votre compte.' };
  }
}

  // ── FORGOT PASSWORD ─────────────────────────────────────
  async forgotPassword(email: string): Promise<{ message: string }> {

    // Chercher l'utilisateur (etablissement ou client)
    let user: any = await this.etablissementRepository.findOne({ where: { email } });
    let repo: any = this.etablissementRepository;

    if (!user) {
      user = await this.clientRepository.findOne({ where: { email } });
      repo = this.clientRepository;
    }

    if (!user) {
      // On ne révèle pas si l'email existe ou non (sécurité)
      return { message: 'Si cet email existe, un lien a été envoyé.' };
    }

    // Générer un token de réinitialisation (valable 1h)
    const resetToken    = crypto.randomBytes(32).toString('hex');
    const resetExpires  = new Date(Date.now() + 60 * 60 * 1000);

    user.verifyToken   = resetToken;
    user.tokenExpires  = resetExpires;
    await repo.save(user);

    // Envoyer l'email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'samyrachallouf4@gmail.com',
        pass: 'hoifdoqbhjghswqr',
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    try {
      await transporter.sendMail({
        from: '"Dyslexio" <samyrachallouf4@gmail.com>',
        to: email,
        subject: 'Réinitialisation de votre mot de passe — Dyslexio',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:40px 32px;
          border-radius:12px;border:1px solid #e2e8f0">
          <h2 style="color:#0D9373">Réinitialiser votre mot de passe</h2>
          <p style="color:#475569;font-size:15px;line-height:1.6">
            Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
            Ce lien est valable <strong>1 heure</strong>.
          </p>
          <div style="text-align:center;margin:32px 0">
            <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;
              background:#0D9373;color:#fff;font-size:15px;font-weight:700;
              border-radius:10px;text-decoration:none">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p style="color:#94a3b8;font-size:12px;text-align:center">
            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
          </p>
        </div>
      `,
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email :", error);
      return { message: 'Une erreur est survenue lors de l\'envoi de l\'email.' };
    }

    return { message: 'Si cet email existe, un lien a été envoyé.' };
  }

  // ── RESET PASSWORD ──────────────────────────────────────
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {

    // Chercher dans etablissement puis client
    let user: any = await this.etablissementRepository.createQueryBuilder('etablissement')
      .where('etablissement.verifyToken = :token', { token })
      .getOne();
    let repo: any = this.etablissementRepository;

    if (!user) {
      user = await this.clientRepository.createQueryBuilder('client')
        .where('client.verifyToken = :token', { token })
        .getOne();
      repo = this.clientRepository;
    }

    if (!user) throw new NotFoundException('Lien invalide ou déjà utilisé');

    if (user.tokenExpires && new Date() > user.tokenExpires) {
      throw new BadRequestException('Lien expiré, veuillez en demander un nouveau');
    }

    // Hasher et sauvegarder le nouveau mot de passe
    user.motDePasse   = await bcrypt.hash(newPassword, 10);
    user.verifyToken  = null;
    user.tokenExpires = null;
    await repo.save(user);

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  // ── VÉRIFICATION DE L'EMAIL ─────────────────────────────
  async verifyEmail(token: string): Promise<{ message: string }> {
    const client = await this.clientRepository.createQueryBuilder('client')
      .where('client.verifyToken = :token', { token })
      .getOne();

    if (!client) {
      throw new NotFoundException('Token invalide ou déjà utilisé.');
    }

    if (client.tokenExpires && new Date() > client.tokenExpires) {
      throw new BadRequestException('Le lien de vérification a expiré.');
    }

    client.status = ClientStatus.ACTIVE;
    client.verifyToken = undefined;
    client.tokenExpires = undefined;
    await this.clientRepository.save(client);

    return { message: 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.' };
  }

  // ── DELETE USER ─────────────────────────────────────────
  async deleteUser(email: string): Promise<{ message: string }> {
    // 1. Essayer de supprimer de la table 'etablissement'
    const etabResult = await this.etablissementRepository.delete({ email });

    // Si une ligne a été affectée, l'utilisateur a été trouvé et supprimé
    if (etabResult.affected && etabResult.affected > 0) {
      return { message: `L'utilisateur Etablissement avec l'email ${email} a été supprimé.` };
    }

    // 2. Sinon, essayer de supprimer de la table 'client'
    const clientResult = await this.clientRepository.delete({ email });

    // Si une ligne a été affectée, l'utilisateur a été trouvé et supprimé
    if (clientResult.affected && clientResult.affected > 0) {
      return { message: `L'utilisateur Client avec l'email ${email} a été supprimé.` };
    }

    // 3. Si non trouvé dans les deux tables
    throw new NotFoundException(`Aucun utilisateur trouvé avec l'email ${email}.`);
  }
}
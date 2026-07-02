import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { Eleve } from './eleve.entity';
import { CreateEleveDto } from './dto/create-eleve.dto';
import { UpdatePaiementDto } from './dto/update-paiement.dto';
import { Etablissement } from '../etablissement/etablissement.entity';
import { PaiementStatut } from './eleve.entity';
import { AccountType } from '../etablissement/enums/account-type.enum';

@Injectable()
export class EleveService {
  private readonly logger = new Logger(EleveService.name);

  constructor(
    @InjectRepository(Eleve)
    private eleveRepository: Repository<Eleve>,

    @InjectRepository(Etablissement)
    private etablissementRepository: Repository<Etablissement>,
  ) {}

  // ── Créer le transporteur SMTP ───────────────────────────────────────────────
  private createTransporter() {
    return nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }

  private smtpOk(email?: string): boolean {
    return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && email);
  }

  // ── Email identifiants après paiement ────────────────────────────────────────
  private async sendIdentifiantsEmail(
    eleve: Eleve,
    motDePasseClair: string,
    etablissementNom: string,
  ): Promise<void> {
    if (!this.smtpOk(eleve.email)) {
      this.logger.warn(`Email non envoyé : SMTP manquant ou email absent pour ${eleve.prenom} ${eleve.nom}`);
      return;
    }

    const smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0D9373; padding: 28px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Bienvenue, ${eleve.prenom} ! 🎉</h1>
          <p style="color: #E1F5EE; margin: 8px 0 0; font-size: 14px;">${etablissementNom}</p>
        </div>
        <div style="border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; padding: 28px;">
          <p style="color: #0f172a; font-size: 15px;">
            Bonjour <strong>${eleve.prenom} ${eleve.nom}</strong>,
          </p>
          <p style="color: #475569; font-size: 14px;">
            <strong>${etablissementNom}</strong> a créé un compte pour vous sur la plateforme.
            Voici vos identifiants pour vous connecter :
          </p>

          <div style="background: #E1F5EE; border-left: 4px solid #0D9373; border-radius: 8px; padding: 20px 24px; margin: 24px 0;">
            <p style="margin: 0 0 12px; font-weight: 700; color: #0D9373; font-size: 15px;">
              🔐 Vos identifiants de connexion
            </p>
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 140px;">📧 Email</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${eleve.email}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">🔑 Mot de passe</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0f172a; font-family: monospace; font-size: 15px;">${motDePasseClair}</td>
              </tr>
            </table>
          </div>

          <div style="background: #fff7ed; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
            <p style="margin: 0; color: #92400e; font-size: 13px;">
              ⚠️ Pour votre sécurité, pensez à changer votre mot de passe dès votre première connexion.
            </p>
          </div>

          <p style="color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 8px;">
            Cet email a été envoyé automatiquement par <strong>${etablissementNom}</strong>.
            Si vous n'êtes pas concerné(e), veuillez ignorer ce message.
          </p>
        </div>
      </div>
    `;

    try {
      await this.createTransporter().sendMail({
        from:    `"${etablissementNom}" <${smtpFrom}>`,
        to:      eleve.email,
        subject: `🎉 Votre compte — ${etablissementNom}`,
        html,
      });
      this.logger.log(`✅ Email identifiants envoyé à ${eleve.email}`);
    } catch (err) {
      this.logger.error(`❌ Erreur envoi email à ${eleve.email}`, err);
    }
  }

  // ── Créer un élève ───────────────────────────────────────────────────────────
  async create(dto: CreateEleveDto, etablissementId: number): Promise<object> {
    const etablissement = await this.etablissementRepository.findOne({
      where: { id: Number(etablissementId) },
    });

    if (!etablissement) throw new NotFoundException('Établissement introuvable.');

    const motDePasseClair = dto.motDePasse || '';
    let hashedPassword: string | undefined = undefined;
    if (dto.motDePasse) {
      hashedPassword = await bcrypt.hash(dto.motDePasse, 10);
    }

    const eleve = this.eleveRepository.create({
      nom:               dto.nom,
      prenom:            dto.prenom,
      email:             dto.email ? dto.email.toLowerCase() : undefined,
      motDePasse:        hashedPassword,
      motDePasseTemp:    motDePasseClair, // ← stocké temporairement
      typeCompte:        AccountType.ELEVE,
      telephone:         dto.telephone,
      classe:            dto.classe,
      niveau:            dto.niveau,
      parentNom:         dto.parentNom,
      parentTelephone:   dto.parentTelephone,
      montant:           dto.montant ?? 0,
      paiementStatut:    dto.paiementStatut,
      paiementMethode:   dto.paiementMethode,
      paiementReference: dto.paiementReference,
      datePaiement:      dto.datePaiement,
      etablissement,
    });

    const saved = await this.eleveRepository.save(eleve);
    return this.toDto(saved);
  }

  // ── Lister les élèves ────────────────────────────────────────────────────────
  async findAllByEtablissement(etablissementId: number): Promise<object[]> {
    const eleves = await this.eleveRepository
      .createQueryBuilder('eleve')
      .where('eleve.etablissementId = :id', { id: Number(etablissementId) })
      .getMany();
    return eleves.map(e => this.toDto(e));
  }

  // ── Supprimer un élève ───────────────────────────────────────────────────────
  async remove(id: number, etablissementId: number): Promise<void> {
    const eleve = await this.eleveRepository
      .createQueryBuilder('eleve')
      .where('eleve.id = :id AND eleve.etablissementId = :etablissementId', {
        id: Number(id), etablissementId: Number(etablissementId),
      })
      .getOne();

    if (!eleve) throw new NotFoundException('Élève introuvable.');
    await this.eleveRepository.remove(eleve);
  }

  // ── Mettre à jour le paiement ────────────────────────────────────────────────
  async updatePaiement(
    id: number,
    etablissementId: number,
    dto: UpdatePaiementDto,
  ): Promise<object> {
    const eleve = await this.eleveRepository
      .createQueryBuilder('eleve')
      .where('eleve.id = :id AND eleve.etablissementId = :etablissementId', {
        id: Number(id), etablissementId: Number(etablissementId),
      })
      .getOne();

    if (!eleve) throw new NotFoundException('Élève introuvable.');

    if (dto.statut      !== undefined) eleve.paiementStatut    = dto.statut;
    if (dto.montant     !== undefined) eleve.montant           = dto.montant;
    if (dto.methode     !== undefined) eleve.paiementMethode   = dto.methode;
    if (dto.reference   !== undefined) eleve.paiementReference = dto.reference;
    if (dto.datePaiement !== undefined) eleve.datePaiement     = dto.datePaiement;

    if (dto.statut === PaiementStatut.PAYE && !eleve.datePaiement) {
      eleve.datePaiement = new Date().toISOString().slice(0, 10);
    }

    // ✅ Si paiement → envoyer email avec identifiants puis effacer motDePasseTemp
    const doSendEmail = dto.statut === PaiementStatut.PAYE
      && eleve.email
      && eleve.motDePasseTemp;

    const motDePasseTemp = eleve.motDePasseTemp || '';

    if (doSendEmail) {
      eleve.motDePasseTemp = undefined; // effacer après usage
    }

    const saved = await this.eleveRepository.save(eleve);

    if (doSendEmail) {
      const etablissement = await this.etablissementRepository.findOne({
        where: { id: Number(etablissementId) },
      });
      this.sendIdentifiantsEmail(
        saved,
        motDePasseTemp,
        etablissement?.nom || 'votre établissement',
      ).catch((err) => this.logger.error('sendIdentifiantsEmail failed', err));
    }

    return this.toDto(saved);
  }

  // ── Exam ─────────────────────────────────────────────────────────────────────
  async startExam(eleveId: number, durationMinutes: number): Promise<object> {
    const eleve = await this.eleveRepository.findOne({ where: { id: Number(eleveId) } });
    if (!eleve) throw new NotFoundException('Élève introuvable.');
    const endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);
    eleve.examEndTime = endTime;
    const saved = await this.eleveRepository.save(eleve);
    return this.toDto(saved);
  }

  async endExam(eleveId: number): Promise<object> {
    const eleve = await this.eleveRepository.findOne({ where: { id: Number(eleveId) } });
    if (!eleve) throw new NotFoundException('Élève introuvable.');
    eleve.examEndTime = null as any;
    const saved = await this.eleveRepository.save(eleve);
    return this.toDto(saved);
  }

  // ── DTO mapper ───────────────────────────────────────────────────────────────
  private toDto(e: Eleve): object {
    return {
      id:              e.id,
      nom:             e.nom,
      prenom:          e.prenom,
      email:           e.email,
      telephone:       e.telephone,
      classe:          e.classe,
      niveau:          e.niveau,
      parentNom:       e.parentNom,
      parentTelephone: e.parentTelephone,
      examEndTime:     e.examEndTime,
      paiement: {
        montant:      Number(e.montant ?? 0),
        statut:       e.paiementStatut,
        reference:    e.paiementReference,
        methode:      e.paiementMethode,
        datePaiement: e.datePaiement,
      },
    };
  }
}
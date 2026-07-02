// src/shared/services/mailer.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.MAIL_USER || process.env.SMTP_USER || '',
        pass: process.env.MAIL_PASS || process.env.SMTP_PASS || '',
      },
    });
  }

  // ── Vérification email ──────────────────────────────────
  async sendVerificationEmail(
    to: string,
    token: string,
    prenom: string,
  ): Promise<void> {
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: `"Logopédie App" <${process.env.MAIL_USER || process.env.SMTP_USER}>`,
        to,
        subject: 'Activez votre compte Logopédie',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
            <div style="text-align:center; margin-bottom: 24px;">
              <div style="display:inline-block; background: linear-gradient(135deg,#0D9373,#0F6E56);
                border-radius:16px; padding:12px 20px; color:#fff; font-size:20px; font-weight:900;">
                📖 Logopédie
              </div>
            </div>
            <h2 style="color:#0f172a;">Bonjour ${prenom} !</h2>
            <p style="color:#475569;">
              Votre paiement a été confirmé avec succès. 🎉<br/>
              Cliquez sur le bouton ci-dessous pour activer votre compte :
            </p>
            <div style="text-align:center; margin: 32px 0;">
              <a href="${verifyUrl}" style="
                background: linear-gradient(135deg,#0D9373,#0F6E56);
                color:#fff; padding:14px 32px; border-radius:10px;
                text-decoration:none; font-weight:700; font-size:15px;
              ">Activer mon compte</a>
            </div>
            <p style="color:#94a3b8; font-size:12px; text-align:center;">
              Ce lien expire dans <strong>24 heures</strong>.<br/>
              Si vous n'avez pas créé de compte, ignorez cet email.
            </p>
          </div>
        `,
      });
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error);
      throw error;
    }
  }

  // ── Réinitialisation mot de passe ───────────────────────
  async sendPasswordResetEmail(
    to: string,
    token: string,
    prenom: string,
  ): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: `"Logopédie App" <${process.env.MAIL_USER || process.env.SMTP_USER}>`,
        to,
        subject: 'Réinitialisation de votre mot de passe',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
            <h2 style="color:#0f172a;">Bonjour ${prenom} !</h2>
            <p style="color:#475569;">
              Vous avez demandé à réinitialiser votre mot de passe.
            </p>
            <div style="text-align:center; margin: 32px 0;">
              <a href="${resetUrl}" style="
                background: linear-gradient(135deg,#0D9373,#0F6E56);
                color:#fff; padding:14px 32px; border-radius:10px;
                text-decoration:none; font-weight:700; font-size:15px;
              ">Réinitialiser mon mot de passe</a>
            </div>
            <p style="color:#94a3b8; font-size:12px; text-align:center;">
              Ce lien expire dans <strong>1 heure</strong>.<br/>
              Si vous n'avez pas fait cette demande, ignorez cet email.
            </p>
          </div>
        `,
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}`, error);
      throw error;
    }
  }
}
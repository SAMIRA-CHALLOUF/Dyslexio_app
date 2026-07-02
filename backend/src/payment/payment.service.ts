// src/payment/payment.service.ts
import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { EleveService } from '../eleve/eleve.service';
import { PaiementStatut } from '../eleve/eleve.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private stripe: any;

  constructor(
    private readonly authService: AuthService,
    private readonly eleveService: EleveService,
  ) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    const StripeLib = require('stripe');
    const Stripe = StripeLib.default || StripeLib;
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    this.logger.log('✅ Stripe initialized successfully');
  }

  // ── Créer un PaymentIntent ──────────────────────────────
  async createPaymentIntent(
    amount: number,
    paymentMethod: string = 'card',
    currency = 'chf',
    email?: string,
    pendingId?: string,
  ) {
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      throw new BadRequestException('Invalid amount for payment');
    }

    const methodTypes: string[] =
      paymentMethod === 'twint' ? ['twint'] : ['card'];

    const metadata: any = {};
    if (email) metadata.email = email;
    if (pendingId) metadata.pendingId = pendingId;

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
        ...(Object.keys(metadata).length ? { metadata } : {}),
      });

      this.logger.log(
        `PaymentIntent created: ${paymentIntent.id} | amount: ${amount} CHF | method: ${paymentMethod}`,
      );

      return { clientSecret: paymentIntent.client_secret };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error('Failed to create Stripe PaymentIntent', {
        error: msg,
        amount,
        currency,
        paymentMethod,
      });
      throw new InternalServerErrorException(
        'Impossible de créer le paiement: ' + msg,
      );
    }
  }

  // ── Créer un PaymentIntent pour Élève ───────────────────
  async createElevePaymentIntent(
    amount: number,
    eleveId: number,
    etablissementId: number,
    paymentMethod: string = 'card',
    currency = 'chf',
  ) {
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      throw new BadRequestException('Invalid amount for payment');
    }

    const methodTypes: string[] =
      paymentMethod === 'twint' ? ['twint'] : ['card'];

    const metadata: any = {
      eleveId: eleveId.toString(),
      etablissementId: etablissementId.toString(),
    };

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
        metadata,
      });

      this.logger.log(
        `Eleve PaymentIntent created: ${paymentIntent.id} | amount: ${amount} CHF | eleve: ${eleveId}`,
      );

      return { clientSecret: paymentIntent.client_secret };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error('Failed to create Stripe PaymentIntent for Eleve', {
        error: msg,
        amount,
        eleveId,
      });
      throw new InternalServerErrorException(
        "Impossible de créer le paiement pour l'élève: " + msg,
      );
    }
  }

  // ── Créer un PaymentIntent groupé (plusieurs élèves) ────
  async createBulkPaymentIntent(
    eleveIds: number[],
    etablissementId: number,
    amount: number,
    paymentMethod: string = 'card',
    currency = 'chf',
  ) {
    if (!eleveIds || eleveIds.length === 0) {
      throw new BadRequestException('Aucun élève sélectionné');
    }
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      throw new BadRequestException('Montant invalide pour le paiement groupé');
    }

    const metadata: any = {
      bulk: 'true',
      eleveIds: eleveIds.join(','),
      etablissementId: etablissementId ? etablissementId.toString() : '',
    };

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
        metadata,
      });

      this.logger.log(
        `Bulk PaymentIntent created: ${paymentIntent.id} | amount: ${amount} CHF | eleves: ${eleveIds.join(',')}`,
      );

      return { clientSecret: paymentIntent.client_secret };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error('Failed to create bulk Stripe PaymentIntent', {
        error: msg,
        eleveIds,
        amount,
      });
      throw new InternalServerErrorException(
        'Impossible de créer le paiement groupé: ' + msg,
      );
    }
  }

  // ── Webhook Stripe ──────────────────────────────────────
  async handleWebhook(rawBody: Buffer | undefined, signature: string) {
    if (!rawBody) {
      throw new BadRequestException('Request body is missing');
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new InternalServerErrorException('Webhook secret not configured');
    }

    let event: any;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
      this.logger.log(`✅ Webhook received: ${event.type}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error('❌ Webhook signature verification failed', {
        error: errorMessage,
      });
      throw new BadRequestException('Invalid webhook signature');
    }

    try {
      await this.processWebhookEvent(event);
    } catch (error) {
      this.logger.error('❌ Failed to process webhook event', {
        eventType: event.type,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return { received: true };
  }

  // ── Traitement des événements ───────────────────────────
  private async processWebhookEvent(event: any): Promise<void> {
    switch (event.type) {

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        this.logger.log(`✅ Payment succeeded: ${paymentIntent.id}`);

        const pendingId = paymentIntent.metadata?.pendingId;
        const eleveId = paymentIntent.metadata?.eleveId;
        const etablissementId = paymentIntent.metadata?.etablissementId;

        if (pendingId) {
          // Finaliser l'inscription : créer le compte + envoyer email
          await this.authService.finalizeRegistration(pendingId);
        } else if (paymentIntent.metadata?.bulk === 'true' && eleveId === undefined) {
          // Paiement groupé — mettre à jour chaque élève
          const rawIds = paymentIntent.metadata?.eleveIds || '';
          const ids = rawIds.split(',').map(Number).filter(Boolean);
          const etabId = Number(paymentIntent.metadata?.etablissementId);
          const montantParEleve = paymentIntent.amount / 100 / (ids.length || 1);

          await Promise.all(
            ids.map((id) =>
              this.eleveService.updatePaiement(id, etabId, {
                statut: PaiementStatut.PAYE,
                montant: montantParEleve,
                methode: (paymentIntent.payment_method_types[0] === 'twint' ? 'virement' : 'carte') as any,
                reference: paymentIntent.id,
              }),
            ),
          );
          this.logger.log(`Bulk payment: ${ids.length} élèves marqués PAYE (${paymentIntent.id})`);
        } else if (eleveId && etablissementId) {
          await this.eleveService.updatePaiement(Number(eleveId), Number(etablissementId), {
            statut: PaiementStatut.PAYE,
            montant: paymentIntent.amount / 100,
            methode: (paymentIntent.payment_method_types[0] === 'twint' ? 'virement' : 'carte') as any,
            reference: paymentIntent.id,
          });
          this.logger.log(`Eleve ${eleveId} marked as PAYE.`);
        } else {
          this.logger.warn(
            `Payment succeeded but no actionable metadata: ${paymentIntent.id}`,
          );
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        this.logger.warn(`⚠️ Payment failed: ${paymentIntent.id}`);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        this.logger.log(`💰 Charge refunded: ${charge.id}`);
        break;
      }

      default:
        this.logger.debug(`Unhandled webhook event: ${event.type}`);
    }
  }
}
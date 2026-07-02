import { Controller, Post, Body, Headers, Req, Logger } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment-intent')
  async createIntent(
    @Body() body: any,
  ) {
    return this.paymentService.createPaymentIntent(
      body.amount,
      body.paymentMethod,
      'chf',
      body.email,
      body.pendingId,
    );
  }

  @Post('create-eleve-payment-intent')
  async createEleveIntent(@Body() body: any) {
    return this.paymentService.createElevePaymentIntent(
      body.amount,
      body.eleveId,
      body.etablissementId,
      body.paymentMethod,
      'chf',
    );
  }

  @Post('create-bulk-payment-intent')
  async createBulkIntent(@Body() body: any) {
    this.logger.log(`Bulk received: ${JSON.stringify(body)}`);
    return this.paymentService.createBulkPaymentIntent(
      body.eleveIds,
      body.etablissementId,
      body.amount,
      body.paymentMethod,
      'chf',
    );
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentService.handleWebhook(req.rawBody, signature);
  }
}
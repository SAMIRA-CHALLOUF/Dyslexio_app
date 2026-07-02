// src/payment/payment.module.ts
import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { AuthModule } from '../auth/auth.module';
import { EleveModule } from '../eleve/eleve.module';

@Module({
  imports: [AuthModule, EleveModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
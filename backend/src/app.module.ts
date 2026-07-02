import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PredictionsModule } from './predictions/predictions.module';
import { TtsModule } from './tts/tts.module';
import { CorrectionModule } from './correction/correction.module';
import { SttModule } from './stt/stt.module';
import { EleveModule } from './eleve/eleve.module';
import { ClientModule } from './client/client.module';
import { SharedModule } from './shared/shared.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { Eleve } from './eleve/eleve.entity';
import { Client } from './client/client.entity';
import { Admin } from './admin/admin.entity';
import { Etablissement } from './etablissement/etablissement.entity';
import { PendingRegistration } from './pending/pending-registration.entity';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { EtablissementModule } from './etablissement/etablissement.module';
import { RealtimeSttModule } from './realtime-stt/realtime-stt.module';
import { PaymentModule } from './payment/payment.module';
import { PendingRegistrationModule } from './pending/pending-registration.module';

@Module({
  imports: [
    // ✅ Charge le .env globalement pour tout le projet
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('DB_DATABASE') || 'data/database.sqlite',
        entities: [Eleve, Client, Admin, Etablissement, PendingRegistration],
        synchronize: true,
        logging: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),

    SharedModule,
    PredictionsModule,
    TtsModule,
    CorrectionModule,
    SttModule,
    EleveModule,
    AuthModule,
    ClientModule,
    AdminModule,
    EtablissementModule,
    RealtimeSttModule,
    PendingRegistrationModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
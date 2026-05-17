import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { PredictionsModule } from './predictions/predictions.module';
import { TtsModule } from './tts/tts.module';
import { CorrectionModule } from './correction/correction.module';
import { SttModule } from './stt/stt.module';
import { EtablissementModule } from './etablissement/etablissement.module';
import { RealtimeSttModule } from './realtime-stt/realtime-stt.module';
import { ClientModule } from './client/client.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { Etablissement } from './etablissement/etablissement.entity';
import { Client } from './client/client.entity';
import { Eleve } from './eleve/eleve.entity';
import { AuthModule } from './auth/auth.module';
import { EleveModule } from './eleve/eleve.module';
import { AdminModule } from './admin/admin.module';  
import { Admin } from './admin/admin.entity';


@Module({
  imports: [
    // ✅ Charge le .env globalement pour tout le projet
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/database.sqlite',
      entities: [Etablissement, Client, Eleve, Admin],
      synchronize: true,
      logging: true,
    }),

    PredictionsModule,
    TtsModule,
    CorrectionModule,
    SttModule,
    EtablissementModule,
    AuthModule,
    RealtimeSttModule,
    ClientModule,
    EleveModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
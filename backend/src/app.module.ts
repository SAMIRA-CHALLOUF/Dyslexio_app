/* ROLE DU FICHIER: Module racine de l'application. Orchestre les domaines métiers. */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PredictionsModule } from './predictions/predictions.module';
import { TtsModule } from './tts/tts.module';
import { CorrectionModule } from './correction/correction.module';
import { SttModule } from './stt/stt.module';
import { EleveModule } from './eleve/eleve.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { Eleve } from './eleve/eleve.entity';   // ← Important : on importe l'entity
import { AuthModule } from './auth/auth.module';
import { ClientModule } from './client/client.module';
import { Client } from './client/client.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),  
    // Configuration globale de la base de données SQLite
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/database.sqlite',   // Le dossier "data" existe déjà dans ton projet
      entities: [Eleve, Client],          // Ajoute ici toutes tes futures entities
      synchronize: true,                  // ✅ OK pour le développement (crée/modifie la table automatiquement)
      logging: true,                      // Affiche les requêtes SQL dans la console (très utile au début)
    }),

    // Tes modules métier
    PredictionsModule,
    TtsModule,
    CorrectionModule,
    SttModule,
    EleveModule,
    AuthModule,
    ClientModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

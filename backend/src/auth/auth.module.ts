import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Eleve } from '../eleve/eleve.entity';
import { Client } from '../client/client.entity';
import { Etablissement } from '../etablissement/etablissement.entity';
import { ClientModule } from '../client/client.module';
import { EtablissementModule } from '../etablissement/etablissement.module';
import { SharedModule } from '../shared/shared.module';
import { PendingRegistrationModule } from '../pending/pending-registration.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Eleve, Client, Etablissement]),
    ClientModule,
    EtablissementModule,
    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        'Logopédie_SECRET_2026_CHANGE_ME_IN_PRODUCTION',
      signOptions: { expiresIn: '7d' },
    }),
    SharedModule,
    PendingRegistrationModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtModule, JwtAuthGuard],
})
export class AuthModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';        // ← add
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';  // ← add
import { Etablissement } from '../etablissement/etablissement.entity';
import { Client } from '../client/client.entity';
import { Admin } from '../admin/admin.entity'; // <-- Importer Admin
import { EtablissementModule } from '../etablissement/etablissement.module';
import { ClientModule } from '../client/client.module';
import { AdminModule } from '../admin/admin.module'; // <-- Importer AdminModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Etablissement, Client, Admin]), // <-- Ajouter Admin ici
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'Logopédie_SECRET_2026_CHANGE_ME_IN_PRODUCTION',
      signOptions: { expiresIn: '7d' },
    }),
    EtablissementModule,
    ClientModule,
    AdminModule, // <-- Ajouter AdminModule ici
  ],
  controllers: [AuthController],
  providers:   [AuthService, JwtStrategy],                // ← add JwtStrategy
  exports:     [AuthService, JwtModule, PassportModule],  // ← export PassportModule
})
export class AuthModule {}
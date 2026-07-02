import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Admin } from './admin.entity';
import { Eleve } from '../eleve/eleve.entity';
import { Client } from '../client/client.entity';
import { Etablissement } from '../etablissement/etablissement.entity';
import { AdminJwtGuard } from './guards/admin-jwt.guard';

const JWT_SECRET =
  process.env.JWT_SECRET || 'Logopédie_SECRET_2026_CHANGE_ME_IN_PRODUCTION';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, Eleve, Client, Etablissement]),
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminJwtGuard],
  exports: [AdminService],
})
export class AdminModule {}

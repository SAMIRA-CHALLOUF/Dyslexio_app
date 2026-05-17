import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Admin } from './admin.entity';
import { Eleve } from '../eleve/eleve.entity';
import { Client } from '../client/client.entity';

import { Etablissement } from '../etablissement/etablissement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, Eleve, Client, Etablissement]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EtablissementService } from './etablissement.service';
import { EtablissementController } from './etablissement.controller';
import { Etablissement } from './etablissement.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Etablissement]), SharedModule],
  controllers: [EtablissementController],
  providers: [EtablissementService],
  exports: [EtablissementService, TypeOrmModule],
})
export class EtablissementModule {}
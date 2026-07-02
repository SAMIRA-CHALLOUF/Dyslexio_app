import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EleveController } from './eleve.controller';
import { EleveService } from './eleve.service';
import { Eleve } from './eleve.entity';
import { Etablissement } from '../etablissement/etablissement.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Eleve, Etablissement]),
    AuthModule,
  ],
  controllers: [EleveController],
  providers:   [EleveService],
  exports:     [EleveService],
})
export class EleveModule {}
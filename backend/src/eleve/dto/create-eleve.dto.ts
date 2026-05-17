import {
  IsString, IsNotEmpty, IsOptional,
  IsNumber, IsEnum, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaiementStatut, PaiementMethode } from '../eleve.entity';

export class CreateEleveDto {
  // ── Identité ────────────────────────────────────────────────────────────────
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @IsString()
  @IsNotEmpty()
  prenom!: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  // ── Scolarité ───────────────────────────────────────────────────────────────
  @IsString()
  @IsNotEmpty()
  classe!: string;

  @IsString()
  @IsNotEmpty()
  niveau!: string;

  // ── Parent ──────────────────────────────────────────────────────────────────
  @IsString()
  @IsNotEmpty()
  parentNom!: string;

  @IsString()
  @IsNotEmpty()
  parentTelephone!: string;

  // ── Paiement ────────────────────────────────────────────────────────────────
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  montant?: number;

  @IsOptional()
  @IsEnum(PaiementStatut)
  paiementStatut?: PaiementStatut;

  @IsOptional()
  @IsEnum(PaiementMethode)
  paiementMethode?: PaiementMethode;

  @IsOptional()
  @IsString()
  paiementReference?: string;

  @IsOptional()
  @IsString()
  datePaiement?: string;
}
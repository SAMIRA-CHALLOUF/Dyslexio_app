import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaiementMethode, PaiementStatut } from '../eleve.entity';

export class UpdatePaiementDto {
  @IsOptional()
  @IsEnum(PaiementStatut)
  statut?: PaiementStatut;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  montant?: number;

  @IsOptional()
  @IsEnum(PaiementMethode)
  methode?: PaiementMethode;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  datePaiement?: string;
}

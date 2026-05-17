import {
  IsString, IsEmail, IsEnum, IsNotEmpty,
  IsOptional, MinLength,
} from 'class-validator';
import { AccountType } from '../../etablissement/enums/account-type.enum';
import { BillingPeriod } from '../client.entity';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  nom!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le prénom est obligatoire' })
  prenom!: string;

  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: "L'email est obligatoire" })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Minimum 6 caractères' })
  motDePasse!: string;

  @IsString()
  @IsNotEmpty({ message: 'La confirmation est obligatoire' })
  confirmationMotDePasse!: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsEnum(AccountType)
  typeCompte!: AccountType;

  @IsOptional()
  @IsEnum(BillingPeriod, { message: 'Durée invalide' })
  billingPeriod?: BillingPeriod;
}
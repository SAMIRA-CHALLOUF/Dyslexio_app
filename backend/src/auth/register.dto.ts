import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { AccountType } from '../etablissement/enums/account-type.enum';
import { BillingPeriod } from '../client/client.entity';

export class RegisterDto {
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
  @MinLength(6, { message: 'Minimum 6 caractères' })
  motDePasse!: string;

  @IsString()
  @IsNotEmpty({ message: 'La confirmation du mot de passe est obligatoire' })
  confirmationMotDePasse!: string;

  @IsEnum(AccountType, { message: 'Le type de compte doit être client ou etablissement' })
  typeCompte!: AccountType;

  @IsOptional()
  @IsEnum(BillingPeriod, { message: 'Période de facturation invalide' })
  billingPeriod?: BillingPeriod;
}
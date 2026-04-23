import { IsString, IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { AccountType } from '../enums/account-type.enum';

export class CreateEleveDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  nom!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le prénom est obligatoire' })
  prenom!: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsEnum(AccountType, { message: 'Le type de compte doit être client ou eleve' })
  typeCompte!: AccountType;

  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: "L'email est obligatoire" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  motDePasse!: string;

  @IsString()
  @IsNotEmpty({ message: 'La confirmation du mot de passe est obligatoire' })
  confirmationMotDePasse!: string;
}
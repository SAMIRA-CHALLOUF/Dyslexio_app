import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AdminRegisterFirstDto {
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(6)
  motDePasse!: string;
}

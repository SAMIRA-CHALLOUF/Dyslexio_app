// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

// ── DTOs ─────────────────────────────────────────────────────────────────────

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
  @IsNotEmpty({ message: 'La confirmation est obligatoire' })
  confirmationMotDePasse!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le type de compte est obligatoire' })
  typeCompte!: string; // 'client' ou 'etablissement'

  @IsOptional()
  @IsString()
  billingPeriod?: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: "L'email est obligatoire" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  motDePasse!: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: "L'email est obligatoire" })
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Le token est obligatoire' })
  token!: string;

  @IsString()
  @MinLength(6, { message: 'Minimum 6 caractères' })
  newPassword!: string;
}

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty({ message: 'Le token est obligatoire' })
  token!: string;
}

export class FinalizeRegistrationDto {
  @IsString()
  @IsNotEmpty({ message: 'Le pendingId est obligatoire' })
  pendingId!: string;
}

// ── Controller ────────────────────────────────────────────────────────────────

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Étape 1 du flux d'inscription :
   * Sauvegarde les données dans pending_registration et retourne le pendingId.
   * Le compte réel est créé APRÈS confirmation du paiement via webhook Stripe.
   */
  @Post('register')
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(@Body() dto: RegisterDto) {
    return this.authService.registerPending(dto);
  }

  @Post('login')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.motDePasse);
  }

  @Post('forgot-password')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('verify-email')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Post('finalize-registration')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async finalizeRegistration(@Body() dto: FinalizeRegistrationDto) {
    return this.authService.finalizeRegistration(dto.pendingId);
  }
}
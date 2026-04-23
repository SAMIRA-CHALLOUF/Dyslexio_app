import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Eleve } from '../eleve/eleve.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Eleve]),
    JwtModule.register({
      secret: 'Logopédie_SECRET_2026_CHANGE_ME_IN_PRODUCTION', // Change ça plus tard !
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
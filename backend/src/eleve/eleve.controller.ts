import {
  Controller, Post, Get, Delete, Patch,
  Body, Request, Param, ParseIntPipe,
  UseGuards, ForbiddenException,
} from '@nestjs/common';
import { EleveService } from './eleve.service';
import { CreateEleveDto } from './dto/create-eleve.dto';
import { UpdatePaiementDto } from './dto/update-paiement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountType } from '../etablissement/enums/account-type.enum';

@Controller('eleves')
@UseGuards(JwtAuthGuard)          // all routes require a valid JWT
export class EleveController {
  constructor(private readonly eleveService: EleveService) {}

  // POST /eleves — établissement adds a new élève
  @Post()
  create(@Body() dto: CreateEleveDto, @Request() req) {
    if (req.user.typeCompte !== AccountType.ETABLISSEMENT) {
      throw new ForbiddenException('Seuls les établissements peuvent ajouter des élèves.');
    }
    const etablissementId: number = req.user.sub;
    return this.eleveService.create(dto, etablissementId);
  }

  // GET /eleves — returns all élèves for the logged-in établissement
  @Get()
  findAll(@Request() req) {
    if (req.user.typeCompte !== AccountType.ETABLISSEMENT) {
      throw new ForbiddenException('Seuls les établissements peuvent voir les élèves.');
    }
    const etablissementId: number = req.user.sub;
    return this.eleveService.findAllByEtablissement(etablissementId);
  }

  @Patch(':id/paiement')
  updatePaiement(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaiementDto,
    @Request() req,
  ) {
    if (req.user.typeCompte !== AccountType.ETABLISSEMENT) {
      throw new ForbiddenException('Seuls les établissements peuvent modifier les paiements.');
    }
    return this.eleveService.updatePaiement(id, req.user.sub, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    if (req.user.typeCompte !== AccountType.ETABLISSEMENT) {
      throw new ForbiddenException('Seuls les établissements peuvent supprimer des élèves.');
    }
    const etablissementId: number = req.user.sub;
    return this.eleveService.remove(id, etablissementId);
  }

  @Post(':id/exam/start')
  startExam(
    @Param('id', ParseIntPipe) id: number,
    @Body('duration') duration: number,
    @Request() req,
  ) {
    if (req.user.typeCompte !== AccountType.ELEVE || req.user.sub !== id) {
      throw new ForbiddenException('Seuls les élèves peuvent démarrer leur propre examen.');
    }
    return this.eleveService.startExam(id, duration || 60);
  }

  @Post(':id/exam/end')
  endExam(@Param('id', ParseIntPipe) id: number, @Request() req) {
    if (req.user.typeCompte !== AccountType.ELEVE || req.user.sub !== id) {
      throw new ForbiddenException('Seuls les élèves peuvent terminer leur propre examen.');
    }
    return this.eleveService.endExam(id);
  }
}
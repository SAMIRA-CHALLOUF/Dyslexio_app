import {
  Controller, Post, Get, Delete,
  Body, Request, Param, ParseIntPipe,
  UseGuards, ForbiddenException,
} from '@nestjs/common';
import { EleveService } from './eleve.service';
import { CreateEleveDto } from './dto/create-eleve.dto';
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

  // DELETE /eleves/:id — remove an élève belonging to this établissement
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    if (req.user.typeCompte !== AccountType.ETABLISSEMENT) {
      throw new ForbiddenException('Seuls les établissements peuvent supprimer des élèves.');
    }
    const etablissementId: number = req.user.sub;
    return this.eleveService.remove(id, etablissementId);
  }
}
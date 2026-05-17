import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Eleve } from './eleve.entity';
import { CreateEleveDto } from './dto/create-eleve.dto';
import { Etablissement } from '../etablissement/etablissement.entity';

@Injectable()
export class EleveService {
  constructor(
    @InjectRepository(Eleve)
    private eleveRepository: Repository<Eleve>,

    @InjectRepository(Etablissement)
    private etablissementRepository: Repository<Etablissement>,
  ) {}

  async create(dto: CreateEleveDto, etablissementId: number): Promise<object> {
    const etablissement = await this.etablissementRepository.findOne({
      where: { id: Number(etablissementId) },
    });

    if (!etablissement) {
      throw new NotFoundException('Établissement introuvable.');
    }

    const eleve = this.eleveRepository.create({
      nom:               dto.nom,
      prenom:            dto.prenom,
      email:             dto.email,
      telephone:         dto.telephone,
      classe:            dto.classe,
      niveau:            dto.niveau,
      parentNom:         dto.parentNom,
      parentTelephone:   dto.parentTelephone,
      montant:           dto.montant ?? 0,
      paiementStatut:    dto.paiementStatut,
      paiementMethode:   dto.paiementMethode,
      paiementReference: dto.paiementReference,
      datePaiement:      dto.datePaiement,
      etablissement,
    });

    const saved = await this.eleveRepository.save(eleve);
    return this.toDto(saved);
  }

  // Fix: QueryBuilder + Number() cast avoids relation-where issues in SQLite
  async findAllByEtablissement(etablissementId: number): Promise<object[]> {
    const eleves = await this.eleveRepository
      .createQueryBuilder('eleve')
      .where('eleve.etablissementId = :id', { id: Number(etablissementId) })
      .getMany();
    return eleves.map(e => this.toDto(e));
  }

  // Fix: same approach for remove scoped to the etablissement
  async remove(id: number, etablissementId: number): Promise<void> {
    const eleve = await this.eleveRepository
      .createQueryBuilder('eleve')
      .where('eleve.id = :id AND eleve.etablissementId = :etablissementId', {
        id:              Number(id),
        etablissementId: Number(etablissementId),
      })
      .getOne();

    if (!eleve) {
      throw new NotFoundException('Élève introuvable.');
    }

    await this.eleveRepository.remove(eleve);
  }

  // Shape the response to match what the frontend expects
  private toDto(e: Eleve): object {
    return {
      id:              e.id,
      nom:             e.nom,
      prenom:          e.prenom,
      email:           e.email,
      telephone:       e.telephone,
      classe:          e.classe,
      niveau:          e.niveau,
      parentNom:       e.parentNom,
      parentTelephone: e.parentTelephone,
      paiement: {
        montant:      Number(e.montant ?? 0),
        statut:       e.paiementStatut,
        reference:    e.paiementReference,
        methode:      e.paiementMethode,
        datePaiement: e.datePaiement,
      },
    };
  }
}
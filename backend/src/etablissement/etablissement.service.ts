import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Etablissement } from './etablissement.entity';
import { CreateEtablissementDto } from './dto/create-etablissement.dto';
import { UpdateEtablissementDto } from './dto/update-etablissement.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EtablissementService {
  constructor(
    @InjectRepository(Etablissement)
    private readonly etablissementRepository: Repository<Etablissement>,
  ) {}

  async create(createEtablissementDto: CreateEtablissementDto): Promise<Etablissement> {
    const { motDePasse, confirmationMotDePasse, ...rest } = createEtablissementDto;

    if (motDePasse !== confirmationMotDePasse) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    const etablissement = this.etablissementRepository.create({
      ...rest,
      motDePasse: hashedPassword,
    });

    return this.etablissementRepository.save(etablissement);
  }

  findAll() {
    return this.etablissementRepository.find();
  }

  findOne(id: number) {
    return this.etablissementRepository.findOneBy({ id });
  }

  async update(id: number, updateEtablissementDto: UpdateEtablissementDto) {
    await this.etablissementRepository.update(id, updateEtablissementDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.etablissementRepository.delete(id);
  }
}
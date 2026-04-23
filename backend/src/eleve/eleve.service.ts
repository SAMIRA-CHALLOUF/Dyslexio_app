import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Eleve } from './eleve.entity';
import { CreateEleveDto } from './dto/create-eleve.dto';
import { UpdateEleveDto } from './dto/update-eleve.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EleveService {
  constructor(
    @InjectRepository(Eleve)
    private readonly eleveRepository: Repository<Eleve>,
  ) {}

  async create(createEleveDto: CreateEleveDto): Promise<Eleve> {
    const { motDePasse, confirmationMotDePasse, ...rest } = createEleveDto;

    if (motDePasse !== confirmationMotDePasse) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    const eleve = this.eleveRepository.create({
      ...rest,
      motDePasse: hashedPassword,
    });

    return this.eleveRepository.save(eleve);
  }

  findAll() {
    return this.eleveRepository.find();
  }

  findOne(id: number) {
    return this.eleveRepository.findOneBy({ id });
  }

  async update(id: number, updateEleveDto: UpdateEleveDto) {
    await this.eleveRepository.update(id, updateEleveDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.eleveRepository.delete(id);
  }
}
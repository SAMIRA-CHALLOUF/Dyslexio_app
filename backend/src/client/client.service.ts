import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { BillingPeriod } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const { motDePasse, confirmationMotDePasse, billingPeriod, ...rest } = createClientDto;

    if (motDePasse !== confirmationMotDePasse) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    const subscribedAt = new Date();
    const expiresAt = new Date(subscribedAt);

    if (billingPeriod) {
      switch (billingPeriod) {
        case BillingPeriod.BIANNUAL:
          expiresAt.setMonth(expiresAt.getMonth() + 6);
          break;
        case BillingPeriod.ANNUAL:
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          break;
        case BillingPeriod.BIENNIAL:
          expiresAt.setFullYear(expiresAt.getFullYear() + 2);
          break;
        default:
          // Peut-être gérer une erreur si la période est fournie mais invalide
          break;
      }
    }

    const clientData: Partial<Client> = {
      ...rest,
      motDePasse: hashedPassword,
      subscribedAt,
      expiresAt,
      ...(billingPeriod && { billingPeriod }),
    };

    const client = this.clientRepository.create(clientData);

    return this.clientRepository.save(client);
  }

  findAll() {
    return this.clientRepository.find();
  }

  findOne(id: number) {
    return this.clientRepository.findOneBy({ id });
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    await this.clientRepository.update(id, updateClientDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.clientRepository.delete(id);
  }
}
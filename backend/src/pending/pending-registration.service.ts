// src/pending/pending-registration.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PendingRegistration, PendingAccountType } from './pending-registration.entity';

@Injectable()
export class PendingRegistrationService {
  constructor(
    @InjectRepository(PendingRegistration)
    private readonly repo: Repository<PendingRegistration>,
  ) {}

  // Crée ou remplace un pending (utile si l'utilisateur réessaie)
  async createOrReplace(data: Partial<PendingRegistration>): Promise<PendingRegistration> {
    // Supprimer l'ancien si existant
    const existing = await this.repo.findOne({ where: { email: data.email } });
    if (existing) {
      await this.repo.delete(existing.id);
    }

    const hashed = await bcrypt.hash(data.motDePasse || '', 10);
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const record = this.repo.create({
      nom: data.nom!,
      prenom: data.prenom!,
      email: data.email!,
      motDePasse: hashed,
      typeCompte: data.typeCompte || PendingAccountType.CLIENT,
      billingPeriod: data.billingPeriod,
      verifyToken,
      tokenExpires,
      completed: false,
    });

    return this.repo.save(record);
  }

  // Ancienne méthode gardée pour compatibilité
  async create(data: Partial<PendingRegistration>): Promise<PendingRegistration> {
    return this.createOrReplace(data);
  }

  findById(id: string): Promise<PendingRegistration | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<PendingRegistration | null> {
    return this.repo.findOne({ where: { email } });
  }

  async markCompleted(id: string): Promise<boolean> {
    const result = await this.repo.update(
      { id, completed: false },
      { completed: true }
    );
    return result.affected ? result.affected > 0 : false;
  }

  async deleteByEmail(email: string): Promise<void> {
    await this.repo.delete({ email });
  }

  findByVerifyToken(verifyToken: string): Promise<PendingRegistration | null> {
    return this.repo.findOne({ where: { verifyToken } });
  }

  async deleteById(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
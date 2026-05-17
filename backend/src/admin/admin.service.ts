import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThan } from 'typeorm';
import { Admin } from './admin.entity';
import { Eleve } from '../eleve/eleve.entity';
import { Client } from '../client/client.entity';
import { Etablissement } from '../etablissement/etablissement.entity'; // Importer Etablissement
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,

    @InjectRepository(Etablissement) // Injecter EtablissementRepository
    private etablissementRepository: Repository<Etablissement>,

    @InjectRepository(Eleve)
    private eleveRepository: Repository<Eleve>,

    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  // ── Créer admin ─────────────────────────────────────────
  async create(adminData: Partial<Admin>): Promise<Admin> {
    if (!adminData.motDePasse) throw new Error('Le mot de passe est requis');
    const hashedPassword = await bcrypt.hash(adminData.motDePasse, 10);
    const newAdmin = this.adminRepository.create({ ...adminData, motDePasse: hashedPassword });
    return this.adminRepository.save(newAdmin);
  }

  async findAll(): Promise<Admin[]> {
    return this.adminRepository.find();
  }

  async findOne(id: number): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) throw new NotFoundException(`Admin avec l'id ${id} introuvable`);
    return admin;
  }

  async update(id: number, updateData: Partial<Admin>): Promise<Admin> {
    const admin = await this.findOne(id);
    if (updateData.motDePasse) {
      updateData.motDePasse = await bcrypt.hash(updateData.motDePasse, 10);
    }
    Object.assign(admin, updateData);
    return this.adminRepository.save(admin);
  }

  async remove(id: number): Promise<void> {
    const admin = await this.findOne(id);
    await this.adminRepository.remove(admin);
  }

  // ── Liste utilisateurs (clients + élèves + etablissements) ───────────────
  async getUsers(type: string, search: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const searchConditions = search ? [
        { nom: Like(`%${search}%`) },
        { prenom: Like(`%${search}%`) },
        { email: Like(`%${search}%`) },
    ] : {};

    let allUsers: any[] = [];
    let total = 0;
    const effectiveType = type === '' ? 'all' : type;

    if (effectiveType === 'all' || effectiveType === 'client') {
        const [clients, count] = await this.clientRepository.findAndCount({
            where: searchConditions,
            order: { createdAt: 'DESC' },
            ...(effectiveType === 'client' && { skip, take: limit }),
        });
        allUsers.push(...clients.map(c => ({
            id: `client-${c.id}`,
            name: `${c.prenom} ${c.nom}`,
            email: c.email,
            type: 'client',
            createdAt: c.createdAt,
            isActive: c.status === 'active',
        })));
        total += count;
    }

    if (effectiveType === 'all' || effectiveType === 'etablissement') {
        const [etablissements, count] = await this.etablissementRepository.findAndCount({
            where: searchConditions,
            order: { createdAt: 'DESC' },
            ...(effectiveType === 'etablissement' && { skip, take: limit }),
        });
        allUsers.push(...etablissements.map(e => ({
            id: `etablissement-${e.id}`,
            name: `${e.prenom} ${e.nom}`,
            email: e.email,
            type: 'etablissement',
            createdAt: e.createdAt,
            isActive: true,
        })));
        total += count;
    }

    if (effectiveType === 'all' || effectiveType === 'eleve') {
        const [eleves, count] = await this.eleveRepository.findAndCount({
            where: searchConditions,
            order: { id: 'DESC' },
            ...(effectiveType === 'eleve' && { skip, take: limit }),
        });
        allUsers.push(...eleves.map(e => ({
            id: `eleve-${e.id}`,
            name: `${e.prenom} ${e.nom}`,
            email: e.email,
            type: 'eleve',
            createdAt: new Date(),
            isActive: true,
        })));
        total += count;
    }

    if (effectiveType === 'all') {
        allUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const paginatedUsers = allUsers.slice(skip, skip + limit);
        return { users: paginatedUsers, total: allUsers.length };
    }
    
    return { users: allUsers, total };
  }

  // ── Stats dashboard ──────────────────────────────────────
  async getStats() {
    const totalClients = await this.clientRepository.count();
    const totalEleves = await this.eleveRepository.count();
    const totalEtablissements = await this.etablissementRepository.count(); // Compter les établissements
    const activeSubscriptions = await this.clientRepository.count({ where: { status: 'active' as any } });

    // Calcul des tendances (exemple simple : nouveaux utilisateurs ce mois-ci)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const newClients = await this.clientRepository.count({ where: { createdAt: MoreThan(oneMonthAgo) } });
    const newEtablissements = await this.etablissementRepository.count({ where: { createdAt: MoreThan(oneMonthAgo) } });

    const previousMonthClients = totalClients - newClients;
    const usersTrend = previousMonthClients > 0 ? Math.round((newClients / previousMonthClients) * 100) : (newClients > 0 ? 100 : 0);


    return {
      totalUsers: totalClients + totalEleves + totalEtablissements,
      usersTrend,
      activeSubscriptions,
      subsTrend: 0, // Logique de tendance des abonnements à implémenter
      totalEtablissements,
      etablissementsTrend: 0, // Logique de tendance des établissements à implémenter
      totalEleves,
      elevesTrend: 0,
    };
  }

  // ── Utilisateurs récents ─────────────────────────────────
  async getRecentUsers(limit: number) {
    const recentClients = await this.clientRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });

    const recentEtablissements = await this.etablissementRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });

    // Mapper les données dans un format unifié
    const allRecent = [
      ...recentClients.map(c => ({
        id: `client-${c.id}`,
        name: `${c.prenom} ${c.nom}`,
        email: c.email,
        type: 'client',
        createdAt: c.createdAt,
        isActive: c.status === 'active',
      })),
      ...recentEtablissements.map(e => ({
        id: `etablissement-${e.id}`,
        name: `${e.prenom} ${e.nom}`,
        email: e.email,
        type: 'etablissement',
        createdAt: e.createdAt,
        isActive: true, // Les établissements sont toujours actifs pour l'instant
      })),
    ];

    // Trier par date de création et prendre la limite
    return allRecent
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // ── Toggle statut utilisateur ────────────────────────────
  async toggleUserStatus(userId: string, isActive: boolean) {
    const [type, id] = userId.split('-');
    if (type === 'client') {
      const client = await this.clientRepository.findOne({ where: { id: +id } });
      if (!client) throw new NotFoundException('Client introuvable');
      client.status = isActive ? 'active' as any : 'pending' as any;
      await this.clientRepository.save(client);
    }
    return { success: true };
  }

  // ── Supprimer utilisateur ────────────────────────────────
  async deleteUser(userId: string) {
    const [type, id] = userId.split('-');
    if (type === 'client') {
      const client = await this.clientRepository.findOne({ where: { id: +id } });
      if (!client) throw new NotFoundException('Client introuvable');
      await this.clientRepository.remove(client);
    } else if (type === 'eleve') {
      const eleve = await this.eleveRepository.findOne({ where: { id: +id } });
      if (!eleve) throw new NotFoundException('Élève introuvable');
      await this.eleveRepository.remove(eleve);
    }
    return { success: true };
  }
}
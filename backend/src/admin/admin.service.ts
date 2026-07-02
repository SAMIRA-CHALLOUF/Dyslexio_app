import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Admin } from './admin.entity';
import { Eleve } from '../eleve/eleve.entity';
import { Client, ClientStatus, BillingPeriod } from '../client/client.entity';
import { Etablissement } from '../etablissement/etablissement.entity';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminRegisterFirstDto } from './dto/admin-register-first.dto';
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

    private readonly jwtService: JwtService,
  ) {}

  async registerFirst(dto: AdminRegisterFirstDto) {
    const count = await this.adminRepository.count();
    if (count > 0) {
      throw new ForbiddenException('Un administrateur existe déjà.');
    }
    const hashed = await bcrypt.hash(dto.motDePasse, 10);
    await this.adminRepository.save(
      this.adminRepository.create({
        nom: dto.nom,
        email: dto.email,
        motDePasse: hashed,
      }),
    );
    return { message: 'Compte administrateur créé.' };
  }

  async login(dto: AdminLoginDto) {
    const admin = await this.adminRepository.findOne({ where: { email: dto.email } });
    if (!admin || !(await bcrypt.compare(dto.motDePasse, admin.motDePasse))) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    const access_token = this.jwtService.sign(
      { sub: admin.id, email: admin.email, nom: admin.nom, role: 'admin' },
      { expiresIn: '8h' },
    );
    return {
      access_token,
      admin: { id: admin.id, email: admin.email, nom: admin.nom, role: 'admin' },
    };
  }

  private subscriptionStatus(client: Client): string {
    if (client.status === ClientStatus.PENDING) return 'pending';
    if (client.expiresAt && new Date(client.expiresAt) < new Date()) return 'expired';
    if (client.status === ClientStatus.ACTIVE) return 'active';
    return 'cancelled';
  }

  private planAmount(period: BillingPeriod): number {
    const map: Record<BillingPeriod, number> = {
      [BillingPeriod.BIANNUAL]: 49,
      [BillingPeriod.ANNUAL]: 89,
      [BillingPeriod.BIENNIAL]: 149,
    };
    return map[period] ?? 0;
  }

  // Unified view returned by getUsers / recent users
  private mapToUserView(entry: any, type: 'client' | 'etablissement' | 'eleve') {
    switch (type) {
      case 'client':
        return {
          id: `client-${entry.id}`,
          name: `${entry.prenom} ${entry.nom}`,
          email: entry.email,
          type: 'client',
          createdAt: entry.createdAt,
          isActive: entry.status === 'active',
        };
      case 'etablissement':
        return {
          id: `etablissement-${entry.id}`,
          name: `${entry.prenom} ${entry.nom}`,
          email: entry.email,
          type: 'etablissement',
          createdAt: entry.createdAt,
          isActive: true,
        };
      case 'eleve':
      default:
        return {
          id: `eleve-${entry.id}`,
          name: `${entry.prenom} ${entry.nom}`,
          email: entry.email,
          type: 'eleve',
          createdAt: entry.createdAt ?? new Date(),
          isActive: true,
        };
    }
  }

  private buildSearchWhere(search: string) {
    if (!search) return undefined;
    const q = `%${search}%`;
    return [
      { nom: Like(q) },
      { prenom: Like(q) },
      { email: Like(q) },
    ];
  }

  async getSubscriptions(statusFilter = '', search = '') {
    const clients = await this.clientRepository.find({ order: { subscribedAt: 'DESC' } });
    let list = clients.map((c) => ({
      id: `client-${c.id}`,
      userName: `${c.prenom} ${c.nom}`,
      userEmail: c.email,
      plan: c.billingPeriod,
      status: this.subscriptionStatus(c),
      startDate: c.subscribedAt,
      endDate: c.expiresAt,
      amount: this.planAmount(c.billingPeriod),
    }));
    if (statusFilter) list = list.filter((s) => s.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.userName.toLowerCase().includes(q) ||
          s.userEmail.toLowerCase().includes(q),
      );
    }
    return list;
  }

  async getSubscriptionStats() {
    const clients = await this.clientRepository.find();
    const stats = { active: 0, pending: 0, expired: 0, cancelled: 0 };
    for (const c of clients) {
      const s = this.subscriptionStatus(c);
      if (s in stats) stats[s as keyof typeof stats]++;
    }
    return stats;
  }

  async updateSubscription(
    clientId: number,
    body: { billingPeriod?: BillingPeriod; status?: string; expiresAt?: string },
  ) {
    const client = await this.clientRepository.findOne({ where: { id: clientId } });
    if (!client) throw new NotFoundException('Client introuvable');
    if (body.billingPeriod) client.billingPeriod = body.billingPeriod;
    if (body.status === 'active') client.status = ClientStatus.ACTIVE;
    if (body.status === 'pending') client.status = ClientStatus.PENDING;
    if (body.expiresAt) client.expiresAt = new Date(body.expiresAt);
    await this.clientRepository.save(client);
    return { success: true };
  }

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
    const skip = Math.max(0, (page - 1) * limit);
    const effectiveType = type === '' ? 'all' : type;
    const where = this.buildSearchWhere(search);

    let users: any[] = [];
    let total = 0;

    const fetchAndMap = async (repo: Repository<any>, entityType: 'client' | 'etablissement' | 'eleve') => {
      const options: any = { order: { createdAt: 'DESC' } };
      if (where) options.where = where;
      if (effectiveType === entityType) {
        options.skip = skip;
        options.take = limit;
      }
      const [rows, count] = await repo.findAndCount(options);
      users.push(...rows.map((r: any) => this.mapToUserView(r, entityType)));
      total += count;
    };

    if (effectiveType === 'all' || effectiveType === 'client') {
      await fetchAndMap(this.clientRepository, 'client');
    }
    if (effectiveType === 'all' || effectiveType === 'etablissement') {
      await fetchAndMap(this.etablissementRepository, 'etablissement');
    }
    if (effectiveType === 'all' || effectiveType === 'eleve') {
      await fetchAndMap(this.eleveRepository, 'eleve');
    }

    if (effectiveType === 'all') {
      users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const paginated = users.slice(skip, skip + limit);
      return { users: paginated, total: users.length };
    }

    return { users, total };
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
    } else if (type === 'etablissement') {
      const etab = await this.etablissementRepository.findOne({ where: { id: +id } });
      if (!etab) throw new NotFoundException('Établissement introuvable');
      await this.etablissementRepository.remove(etab);
    }
    return { success: true };
  }
}
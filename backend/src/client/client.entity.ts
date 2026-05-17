import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { AccountType } from '../etablissement/enums/account-type.enum'; // ou un dossier shared

export enum ClientStatus {
  PENDING = 'pending',
  ACTIVE  = 'active',
}

export enum BillingPeriod {
  BIANNUAL = 'biannual',
  ANNUAL   = 'annual',
  BIENNIAL = 'biennial',
}

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nom!: string;

  @Column()
  prenom!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  motDePasse!: string;

  @Column({ nullable: true })
  image?: string;

  @Column({
    type: 'simple-enum',
    enum: AccountType,
    default: AccountType.CLIENT,
  })
  typeCompte!: AccountType;

  // ── Abonnement ──────────────────────────────────────────
  @Column({ type: 'simple-enum', enum: BillingPeriod })
  billingPeriod!: BillingPeriod;

  @Column({ type: 'datetime' })
  subscribedAt!: Date;

  @Column({ type: 'datetime' })
  expiresAt!: Date;

  // ── Vérification email ──────────────────────────────────
  @Column({
    type: 'simple-enum',
    enum: ClientStatus,
    default: ClientStatus.PENDING,
  })
  status!: ClientStatus;

  @Column({ nullable: true })
  verifyToken?: string;

  @Column({ type: 'datetime', nullable: true })
  tokenExpires?: Date;

  // ── Dates système ───────────────────────────────────────
  @CreateDateColumn()
  createdAt!: Date;
}
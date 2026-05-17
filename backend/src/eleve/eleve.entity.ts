import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Etablissement } from '../etablissement/etablissement.entity';

export enum PaiementStatut {
  PAYE      = 'payé',
  EN_ATTENTE = 'en attente',
  RETARD    = 'retard',
}

export enum PaiementMethode {
  VIREMENT  = 'virement',
  ESPECES   = 'especes',
  CHEQUE    = 'cheque',
  CARTE     = 'carte',
}

@Entity()
export class Eleve {
  @PrimaryGeneratedColumn()
  id!: number;

  // ── Identité ────────────────────────────────────────────────────────────────
  @Column()
  nom!: string;

  @Column()
  prenom!: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  telephone?: string;

  // ── Scolarité ───────────────────────────────────────────────────────────────
  @Column()
  classe!: string;

  @Column()
  niveau!: string;

  // ── Parent / Tuteur ─────────────────────────────────────────────────────────
  @Column()
  parentNom!: string;

  @Column()
  parentTelephone!: string;

  // ── Paiement ────────────────────────────────────────────────────────────────
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  montant!: number;

  @Column({
    type: 'simple-enum',
    enum: PaiementStatut,
    default: PaiementStatut.EN_ATTENTE,
  })
  paiementStatut!: PaiementStatut;

  @Column({ nullable: true })
  paiementReference?: string;

  @Column({
    type: 'simple-enum',
    enum: PaiementMethode,
    default: PaiementMethode.ESPECES,
  })
  paiementMethode!: PaiementMethode;

  @Column({ type: 'date', nullable: true })
  datePaiement?: string;

  // ── Relation ────────────────────────────────────────────────────────────────
  @ManyToOne(() => Etablissement, etablissement => etablissement.eleves, {
    onDelete: 'CASCADE',
  })
  etablissement!: Etablissement;

  @CreateDateColumn()
  createdAt!: Date;
}
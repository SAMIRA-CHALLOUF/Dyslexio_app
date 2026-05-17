import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { AccountType } from './enums/account-type.enum';
import { Eleve } from '../eleve/eleve.entity';

@Entity()
export class Etablissement {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nom!: string;

  @Column()
  prenom!: string;

  @Column({ nullable: true })
  image?: string;

  @Column({
    type: 'simple-enum',
    enum: AccountType,
    default: AccountType.ETABLISSEMENT,
  })
  typeCompte!: AccountType;

  @Column({ unique: true })
  email!: string;

  @Column()
  motDePasse!: string;

  // ── Réinitialisation mot de passe ────────────────────────
  @Column({ nullable: true })
  verifyToken?: string;

  @Column({ type: 'datetime', nullable: true })
  tokenExpires?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  // Relation: Un établissement peut avoir plusieurs élèves
  @OneToMany(() => Eleve, eleve => eleve.etablissement)
  eleves!: Eleve[];
}
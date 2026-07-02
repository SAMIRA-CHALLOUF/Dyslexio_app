import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum PendingAccountType {
  CLIENT = 'client',
  ETABLISSEMENT = 'etablissement',
}

@Entity({ name: 'pending_registration' })
export class PendingRegistration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nom!: string;

  @Column()
  prenom!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  motDePasse!: string;

  @Column({ type: 'simple-enum', enum: PendingAccountType })
  typeCompte!: PendingAccountType;

  @Column({ nullable: true })
  billingPeriod?: string;

  @Column({ nullable: true })
  verifyToken?: string;

  @Column({ type: 'datetime', nullable: true })
  tokenExpires?: Date;

  @Column({ default: false })
  completed!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AccountType } from './enums/account-type.enum';

@Entity()
export class Eleve {
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
    default: AccountType.ELEVE,
  })
  typeCompte!: AccountType;

  @Column({ unique: true })
  email!: string;

  @Column()
  motDePasse!: string;
}
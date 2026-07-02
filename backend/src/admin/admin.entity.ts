import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  motDePasse!: string;

  @Column()
  nom!: string;

  @CreateDateColumn()
  createdAt!: Date;
}

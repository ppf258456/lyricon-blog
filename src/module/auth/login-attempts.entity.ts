import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class LoginAttempts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  ip: string;

  @Column()
  successful: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

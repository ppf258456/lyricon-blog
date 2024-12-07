import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';

import { Exclude } from 'class-transformer';
import { RefreshToken } from '../auth/refresh-token.entity';
export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export enum UserLevel {
  LEVEL_0 = 0,
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  LEVEL_4 = 4,
  LEVEL_5 = 5,
  LEVEL_6 = 6,
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  uid: string; // 用户唯一标识符

  @Column({ nullable: false, unique: true })
  username: string; // 用户名

  @Exclude() // 排除password字段
  @Column()
  password: string; // 用户密码（应加密存储）

  @Column({ nullable: false, unique: true })
  email: string; // 用户电子邮件

  @Column({ default: true })
  isActive: boolean; // 用户是否激活

  @Column({ type: 'enum', enum: UserRole, default: UserRole.VIEWER })
  role: UserRole;

  @Column({ nullable: true, type: 'longtext' })
  avatar: string; // 头像

  @Column({ nullable: true, type: 'longtext' })
  backgroundImage: string; // 背景图 URL

  @Column({ nullable: true })
  bio: string; // 个人简介

  @Column({ default: 0 })
  coins: number; // 硬币数

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date; // 最后登录时间

  @Column('simple-array', { nullable: true })
  devices: string[]; // 登录设备

  @ManyToMany(() => User)
  @JoinTable()
  fans: User[]; // 粉丝

  @ManyToMany(() => User)
  @JoinTable()
  following: User[]; // 关注的用户

  @Column({
    type: 'enum',
    enum: UserLevel,
    default: UserLevel.LEVEL_0,
  })
  level: UserLevel; // 用户等级

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date; // 创建时间

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date; // 更新时间

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date; // 软删除时间

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];
}

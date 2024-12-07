import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';

import { User } from '../user/user.entity'; // 导入 User 实体

@Entity({ name: 'refresh_tokens' })
export class RefreshToken {
  @PrimaryGeneratedColumn('increment')
  id: number; // Refresh Token 的唯一标识符

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User; // 关联的用户，外键关联到 users 表的 id 字段

  @Column({ type: 'varchar', length: 512 })
  token: string; // 存储生成的 Refresh Token 字符串

  @Column({ type: 'timestamp' })
  expiresAt: Date; // Refresh Token 的过期时间

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date; // Refresh Token 创建的时间

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string; // 生成该 Token 时的客户端 IP 地址，支持 IPv4 和 IPv6

  @Column({ type: 'varchar', length: 255, nullable: true })
  deviceInfo: string; // 生成该 Token 时的设备信息，如浏览器或操作系统

  @Column({ type: 'boolean', default: false })
  isRevoked: boolean; // 标记 Refresh Token 是否被撤销，默认为未吊销

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date; // 软删除时间，表示这个 Token 是否被删除
}

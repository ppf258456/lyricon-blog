import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { RefreshToken } from './refresh-token.entity';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  // 创建并保存 Refresh Token
  async createRefreshToken(
    user: User,
    deviceInfo: string,
    ipAddress: string,
  ): Promise<RefreshToken> {
    // 撤销旧的 Token（同一设备登录时）
    await this.revokeOldToken(user, deviceInfo);
    const refreshToken = this.jwtService.sign(
      { uid: user.uid, email: user.email },
      { expiresIn: '7d' }, // 设置过期时间
    );

    const newRefreshToken = this.refreshTokenRepository.create({
      user: user,
      token: refreshToken,
      expiresAt: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 设置有效期为 7 天
      ipAddress: ipAddress,
      deviceInfo: deviceInfo,
    });

    return await this.refreshTokenRepository.save(newRefreshToken);
  }

  // 撤销同一设备的旧 Refresh Token
  private async revokeOldToken(user: User, deviceInfo: string): Promise<void> {
    const oldToken = await this.refreshTokenRepository.findOne({
      where: {
        user: { id: user.id },
        deviceInfo: deviceInfo,
        isRevoked: false,
        deletedAt: IsNull(),
      },
    });

    if (oldToken) {
      console.log(
        `Revoking old refresh token for user ${user.email || user.uid} on device ${deviceInfo}`,
      );

      oldToken.isRevoked = true; // 将旧的 Token 标记为撤销
      oldToken.deletedAt = new Date(); // 设置删除时间为当前时间
      await this.refreshTokenRepository.save(oldToken);
    } else {
      console.log(
        `No valid refresh token found to revoke for user ${user.email || user.uid} on device ${deviceInfo}`,
      );
    }
  }

  // 提供一个公共接口，供外部调用
  public async revokeOldTokenForExternal(
    user: User,
    deviceInfo: string,
  ): Promise<void> {
    return this.revokeOldToken(user, deviceInfo);
  }

  // 注销 Refresh Token（撤销单个设备的 Token）
  async revokeToken(refreshToken: string): Promise<void> {
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (!tokenRecord) {
      throw new Error('Refresh token not found');
    }

    tokenRecord.isRevoked = true; // 设置为撤销状态
    await this.refreshTokenRepository.save(tokenRecord);
  }

  // 更新设备信息
  async updateDeviceInfo(
    refreshToken: string,
    newDeviceInfo: string,
  ): Promise<void> {
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (!tokenRecord) {
      throw new Error('Refresh token not found');
    }

    tokenRecord.deviceInfo = newDeviceInfo;
    await this.refreshTokenRepository.save(tokenRecord);
  }
}

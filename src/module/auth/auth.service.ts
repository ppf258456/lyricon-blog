import {
  Injectable,
  UnauthorizedException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { RefreshToken } from './refresh-token.entity';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { LoginAttempts } from './login-attempts.entity'; // 登录尝试记录
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(LoginAttempts)
    private readonly loginAttemptsRepository: Repository<LoginAttempts>, // 登录尝试记录
    private readonly jwtService: JwtService,
  ) {}

  // 登录方法（邮箱或UID）
  async login(
    createUserDto: CreateUserDto,
    userAgent: string,
    ip: string,
  ): Promise<any> {
    const { email, password, uid } = createUserDto;

    let user: User;
    // 检查是否提供了 email 或 uid，确保只能有一个
    if (email && uid) {
      this.logger.warn('只能提供一个邮箱或UID');
      throw new UnauthorizedException('只能提供一个邮箱或UID');
    }
    // 根据提供的字段查找用户
    if (email) {
      user = await this.userService.findOneByEmail(email);
    } else if (uid) {
      user = await this.userService.findOneByUid(uid);
    } else {
      this.logger.warn('Neither email nor UID provided');
      throw new UnauthorizedException('邮箱或UID是必填的');
    }

    if (!user) {
      this.logger.warn(`Failed login attempt: User not found`);
      throw new UnauthorizedException('邮箱/UID 错误');
    }

    // 登录尝试限制
    await this.checkLoginAttempts(user.id, ip);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(
        `Failed login attempt: Invalid password for ${user.email || user.uid}`,
      );
      throw new UnauthorizedException('密码错误');
    }

    // 生成 access token
    const accessToken = this.jwtService.sign({
      uid: user.uid,
      email: user.email,
    });

    // 生成 refresh token
    const refreshToken = this.jwtService.sign(
      { uid: user.uid, email: user.email },
      { expiresIn: '7d' },
    );

    // 存储 refresh token 到数据库
    const newRefreshToken = this.refreshTokenRepository.create({
      user: user, // 使用用户实体对象关联
      token: refreshToken,
      expiresAt: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      ipAddress: ip,
      deviceInfo: userAgent,
    });
    await this.refreshTokenRepository.save(newRefreshToken);

    // 记录登录成功
    await this.recordLoginAttempt(user.id, ip, true);

    this.logger.log(`User ${user.email || user.uid} logged in successfully`);

    return {
      accessToken,
      refreshToken,
    };
  }

  // 检查登录尝试次数，防止暴力破解
  private async checkLoginAttempts(userId: number, ip: string): Promise<void> {
    const attempts = await this.loginAttemptsRepository.find({
      where: { userId, ip, successful: false },
      take: 5,
      order: { createdAt: 'DESC' },
    });

    if (attempts.length >= 5) {
      const lastAttemptTime = attempts[0].createdAt.getTime();
      const timeElapsed = new Date().getTime() - lastAttemptTime;

      // 如果 5 次登录失败时间差小于 30 分钟，则限制登录
      if (timeElapsed < 30 * 60 * 1000) {
        this.logger.warn(`当前 ${ip}登录失败次数过多`);
        throw new ConflictException('登录失败过多，请稍后重试');
      }
    }
  }

  // 记录登录尝试日志
  private async recordLoginAttempt(
    userId: number,
    ip: string,
    successful: boolean,
  ): Promise<void> {
    const attempt = this.loginAttemptsRepository.create({
      userId,
      ip,
      successful,
    });

    await this.loginAttemptsRepository.save(attempt);
  }

  // 根据 refresh token 获取新的 access token
  async refreshTokens(refreshToken: string): Promise<any> {
    let payload: any;

    try {
      payload = this.jwtService.verify(refreshToken);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      this.logger.warn(`无效或失效的 refresh token`);
      throw new UnauthorizedException('Refresh token 无效或已过期');
    }

    const refreshTokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (!refreshTokenRecord || refreshTokenRecord.isRevoked) {
      this.logger.warn(`Refresh token 被废除或者不存在`);
      throw new UnauthorizedException('Refresh token 无效');
    }

    const newAccessToken = this.jwtService.sign({
      uid: payload.uid,
      email: payload.email,
    });

    this.logger.log(`这个${payload.email}的new access token 生效`);

    return {
      accessToken: newAccessToken,
      refreshToken: refreshTokenRecord.token,
    };
  }

  // 登出方法
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async logout(refreshToken: string, _userAgent: string): Promise<void> {
    const refreshTokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (!refreshTokenRecord) {
      this.logger.warn(`Invalid refresh token during logout attempt`);
      throw new UnauthorizedException('Refresh token 无效');
    }

    refreshTokenRecord.isRevoked = true;
    await this.refreshTokenRepository.save(refreshTokenRecord);

    this.logger.log(`User登出, refresh token 被销毁`);
  }
}

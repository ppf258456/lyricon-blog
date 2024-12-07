import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface'; // JWT 有效负载的接口
import { UserService } from '../module/user/user.service'; // 用于获取用户数据

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 从 Authorization Header 提取 JWT
      ignoreExpiration: false, // 确保 JWT 到期后会被拒绝
      secretOrKey: configService.get<string>('jwt.secret'), // 使用配置文件中的 JWT 密钥
    });
  }

  async validate(payload: JwtPayload) {
    // 这里通过 payload 的 uid 查找用户
    const user = await this.userService.findOneByUid(payload.uid);

    if (!user) {
      throw new Error('Unauthorized');
    }

    return user; // 如果验证通过，返回用户信息
  }
}

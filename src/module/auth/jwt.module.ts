import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm'; // 引入 TypeOrmModule
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module'; // 引入 UserModule
import { RefreshToken } from './refresh-token.entity'; // 引入 RefreshToken 实体
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from '../../guards/JwtAuthGuard '; // 引入 JwtAuthGuard
import { JwtStrategy } from '../../jwt/JwtStrategy';
import { LoginAttempts } from './login-attempts.entity';
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: { expiresIn: configService.get<string>('jwt.expiresIn') },
      }),
    }),
    UserModule, // 导入 UserModule，确保可以访问 UserService
    TypeOrmModule.forFeature([RefreshToken, LoginAttempts]), // 注册 RefreshToken 实体
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController], // 注册 AuthController
  exports: [JwtModule],
})
export class JwtConfigModule {}

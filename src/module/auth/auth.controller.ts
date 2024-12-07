import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { JwtAuthGuard } from '../../guards/JwtAuthGuard '; // JwtAuthGuard 用于保护接口
import { Request, Response } from 'express';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}
  // 登录接口（支持邮箱/UID）
  @Post('login')
  async login(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const ip = req.ip; // 获取客户端 IP 地址

    try {
      const tokens = await this.authService.login(
        createUserDto,
        userAgent as string,
        ip,
      );
      return res.status(200).json(tokens);
    } catch (error) {
      if (error instanceof ConflictException) {
        return res.status(409).json({ message: error.message });
      }

      if (error instanceof Error) {
        this.logger.error(`Login failed: ${error.message}`);
        return res.status(401).json({ message: error.message });
      }

      this.logger.error(`Login failed: Unknown error`);
      return res.status(500).json({ message: 'Unknown error' });
    }
  }

  // 刷新 Token 接口
  @Post('refresh-token')
  async refreshTokens(
    @Body('refreshToken') refreshToken: string,
    @Res() res: Response,
  ) {
    try {
      const tokens = await this.authService.refreshTokens(refreshToken);
      return res.status(200).json(tokens);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Refresh token failed: ${error.message}`);
        return res.status(401).json({ message: error.message });
      }
    }
  }

  // 登出接口
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Body('refreshToken') refreshToken: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    try {
      await this.authService.logout(refreshToken, userAgent as string);
      return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Logout failed: ${error.message}`);
        return res.status(401).json({ message: error.message });
      }
    }
  }
}
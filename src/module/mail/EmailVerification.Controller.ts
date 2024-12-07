import {
  Controller,
  Post,
  Body,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import {
  SendVerificationCodeDto,
  VerifyCodeDto,
} from './dto/SendVerificationCodeDto';

@Controller('email')
export class EmailVerificationController {
  private readonly logger = new Logger(EmailVerificationController.name);

  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  // 发送验证码
  @Post('send')
  async sendVerificationCode(@Body() body: SendVerificationCodeDto) {
    const { email } = body;
    try {
      await this.emailVerificationService.sendVerificationCode(email);
      return { message: '验证码已发送' };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`验证码发送失败: ${error.message}`);
        throw new BadRequestException(error.message);
      } else {
        this.logger.error('验证码发送失败: 未知错误');
        throw new BadRequestException('未知错误');
      }
    }
  }

  // 验证验证码
  @Post('verify')
  async verifyCode(@Body() body: VerifyCodeDto) {
    const { email, emailVerificationCode } = body;
    try {
      await this.emailVerificationService.verifyCode(
        email,
        emailVerificationCode,
      );
      return { message: '验证码验证成功' };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`验证码验证失败: ${error.message}`);
        throw new BadRequestException(error.message);
      } else {
        this.logger.error('验证码验证失败: 未知错误');
        throw new BadRequestException('未知错误');
      }
    }
  }
}

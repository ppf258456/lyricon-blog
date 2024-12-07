import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { MailerService } from '../mail/mailer.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly redisService: RedisService,
  ) {}

  // 发送验证码
  async sendVerificationCode(email: string): Promise<void> {
    const lastSentKey = `last_sent_time:${email}`;
    const verificationKey = `verification_code:${email}`;

    // 检查 Redis 中的验证码发送时间限制
    const ttl = await this.redisService.ttl(lastSentKey);
    if (ttl > 0) {
      throw new BadRequestException(`请在 ${ttl} 秒后再试`);
    }

    // 生成 6 位验证码
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // 并行保存验证码及发送时间到 Redis
    await Promise.all([
      this.redisService.set(verificationKey, verificationCode, 300), // 验证码有效期 5 分钟
      this.redisService.set(lastSentKey, Date.now().toString(), 60), // 限制 1 分钟内重新发送
    ]);

    // 调用邮件服务发送验证码
    const emailSent = await this.mailerService.sendVerificationCode(
      email,
      verificationCode,
    );
    if (!emailSent) {
      throw new BadRequestException('邮件发送失败，请稍后再试');
    }

    this.logger.log(`验证码发送成功: ${email}`);
  }

  // 验证验证码
  async verifyCode(email: string, code: string): Promise<void> {
    const verificationKey = `verification_code:${email}`;

    // 从 Redis 中获取验证码
    const storedCode = await this.redisService.get(verificationKey);
    if (!storedCode) {
      throw new BadRequestException('验证码无效或已过期');
    }

    if (storedCode !== code) {
      throw new BadRequestException('验证码错误');
    }

    // 验证成功后删除验证码
    await this.redisService.del(verificationKey);

    this.logger.log(`验证码验证成功: ${email}`);
  }
}

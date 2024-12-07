import { Injectable, Logger, Inject } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(
    @Inject('TRANSPORTER') private readonly transporter: nodemailer.Transporter, // 通过标识注入 Transporter
  ) {}

  // 发送验证码邮件
  async sendVerificationCode(
    email: string,
    verificationCode: string,
  ): Promise<boolean> {
    // 发送邮件
    const mailOptions = {
      from: process.env.SMTP_USER, // 发件人地址
      to: email, // 收件人地址
      subject: '邮箱验证码',
      text: `您的验证码是: ${verificationCode}，5分钟内不再发送！！！`,
    };

    try {
      await this.transporter.sendMail(mailOptions); // 使用 Transporter 发送邮件
      this.logger.log(`验证码已发送到 ${email}`);
      return true;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`发送验证码失败: ${err.message}`);
      return false;
    }
  }
}

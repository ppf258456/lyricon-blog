// src/config/mail.config.ts
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Injectable, Logger } from '@nestjs/common';

const logger = new Logger('MailerConfig'); // 创建一个 Logger 实例，用于记录邮件配置的日志

@Injectable()
export class MailConfigService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });

    // 验证邮件服务器是否可连接
    this.verifyMailServer();
  }

  // 验证邮件服务器连接
  private verifyMailServer() {
    this.transporter.verify((error: any) => {
      if (error) {
        console.error('邮件发送验证码错误:', error);
      } else {
        logger.log('邮件服务器已准备好'); // 使用 Logger 记录成功信息
      }
    });
  }

  // 通过此方法访问 configService
  getConfigService(): ConfigService {
    return this.configService;
  }

  // 获取 transporter
  getTransporter(): nodemailer.Transporter {
    return this.transporter;
  }
}

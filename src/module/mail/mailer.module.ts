// src/mail/mailer.module.ts
import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MailConfigService } from '../../config/smtp.config'; // 导入 MailConfigService

@Module({
  providers: [
    MailerService,
    MailConfigService,
    {
      provide: 'TRANSPORTER', // 为 Transporter 提供一个标识
      useFactory: (mailConfigService: MailConfigService) => {
        return mailConfigService.getTransporter(); // 使用 MailConfigService 提供 Transporter
      },
      inject: [MailConfigService],
    },
  ],
  exports: [MailerService, 'TRANSPORTER'], // 导出 MailerService 供其他模块使用
})
export class MailerModule {}

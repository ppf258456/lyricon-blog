// src/email-verification/email-verification.module.ts
import { Module } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import { EmailVerificationController } from './EmailVerification.Controller';
import { MailerService } from './mailer.service';
import { MailerModule } from '../mail/mailer.module'; // 导入 MailerModule

@Module({
  imports: [MailerModule], // 导入 MailerModule
  controllers: [EmailVerificationController], // 引入控制器
  providers: [EmailVerificationService, MailerService], // 引入服务
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}

// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DefaultUserValuesService } from './utils/default-user-values.service';
import { UidService } from '../uid/uidService';
import { EmailVerificationModule } from '../mail/email-verification.module'; // 引入邮件验证模块
import { DataCleanupService } from './data-cleanup.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), EmailVerificationModule], // 直接导入EmailVerificationModule
  providers: [
    UserService,
    DefaultUserValuesService,
    UidService,
    DataCleanupService,
  ],
  controllers: [UserController],
  exports: [UserService], // 如果后续需要在其他模块中使用
})
export class UserModule {}

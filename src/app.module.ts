import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './redis/redis.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module'; // 引入 DatabaseModule
import { UserModule } from './module/user/user.module'; // 引入 UserModule
import { CategoryModule } from './module/category/category.module';
import { MailerModule } from './module/mail/mailer.module'; // 引入 MailerModule
import { EmailVerificationModule } from './module/mail/email-verification.module'; // 导入 EmailVerificationModule
import { JwtConfigModule } from './module/auth/jwt.module'; // 导入我们刚才创建的 JwtConfigModule
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';

import jwtConfig from './config/jwt.config'; // 导入jwt配置文件

@Module({
  imports: [
    ScheduleModule.forRoot(), // 注册定时任务模块
    ConfigModule.forRoot({
      isGlobal: true, // 使得环境变量在全局都可用
      envFilePath: '.env', // 指定 .env 文件路径
      load: [jwtConfig], // 加载 jwt 配置文件
    }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
      inject: [ConfigService], // 注入 ConfigService 来获取环境变量
    }),
    JwtConfigModule,
    RedisModule,
    MailerModule,
    EmailVerificationModule,
    UserModule,
    CategoryModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

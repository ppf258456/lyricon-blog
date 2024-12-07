import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service'; // 引入 RedisService
import redisConfig from './redis.config'; // 之前定义的 redis 配置函数
import { Redis } from 'ioredis';

@Global()
@Module({
  providers: [
    // 使用 `useFactory` 来初始化 Redis 客户端
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService): Redis => {
        console.log('Initializing Redis Client...');
        return redisConfig(configService); // 使用 redis 配置函数来创建 Redis 客户端
      },
      inject: [ConfigService],
    },
    RedisService, // 提供 RedisService 以便其他模块使用
  ],
  exports: ['REDIS_CLIENT', RedisService], // 导出 Redis 客户端和 RedisService
})
export class RedisModule {}

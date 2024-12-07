import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

export default function redisConfig(configService: ConfigService): Redis {
  const redisClient = new Redis({
    host: configService.get<string>('REDIS_HOST', 'localhost'), // 默认为 localhost
    port: configService.get<number>('REDIS_PORT', 6379), // 默认为 6379
    password: configService.get<string>('REDIS_PASSWORD', ''), // 如果没有密码，默认为空
    db: configService.get<number>('REDIS_DB', 0), // 默认数据库为 0
  });

  // 监听 Redis 连接错误
  redisClient.on('error', (error) =>
    console.error('Redis Client Error', error),
  );
  // 连接成功后输出日志
  redisClient.on('connect', () => console.log('Redis Client Connected'));

  return redisClient; // 返回 Redis 客户端实例
}

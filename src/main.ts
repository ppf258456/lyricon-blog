import * as dotenv from 'dotenv';
// 加载环境变量
dotenv.config();
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { RedisService } from './redis/redis.service';
import { ResponseInterceptor } from './Interceptor/ResponseInterceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 使用全局拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());
  const redisService = app.get(RedisService); // 获取 RedisService 实例

  // 检查 Redis 连接
  const isRedisConnected = await redisService.checkConnection();
  if (!isRedisConnected) {
    console.error('Failed to connect to Redis. Application will not start.');
    process.exit(1); // 如果 Redis 连接失败，退出应用
  }

  await app.listen(3000);
}
bootstrap();

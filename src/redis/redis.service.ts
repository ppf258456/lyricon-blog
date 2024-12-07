import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name); // 使用类名来命名日志源

  constructor(
    @Inject('REDIS_CLIENT') private readonly client: Redis, // 注入 Redis 客户端实例
  ) {}

  // 检查 Redis 是否可用
  async checkConnection(): Promise<boolean> {
    try {
      const response = await this.client.ping(); // 使用 PING 命令来测试 Redis 是否在线
      if (response === 'PONG') {
        this.logger.log('Redis is connected');
        return true;
      } else {
        this.logger.error('Redis is not responding correctly');
        return false;
      }
    } catch (err) {
      // 将 err 强制转换为 Error 类型
      const error = err as Error;
      this.logger.error(
        `Redis connection failed: ${error.message}`,
        error.stack,
      ); // 访问 message 和 stack 属性
      return false;
    }
  }
  // 设置键值对，可以选择性地设置过期时间（秒）
  async set(
    key: string,
    value: string,
    expireSeconds?: number,
  ): Promise<string> {
    try {
      const result = await this.client.set(key, value);

      // 如果传递了过期时间参数，则设置过期时间
      if (expireSeconds) {
        await this.client.expire(key, expireSeconds); // 设置过期时间（秒）
      }

      return result;
    } catch (err) {
      const error = err as Error;
      this.logger.error(
        `Failed to set key ${key}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // 获取键的值
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (err) {
      const error = err as Error;
      this.logger.error(
        `Failed to get key ${key}: ${error.message}`,
        error.stack,
      );
      throw error; // 可以抛出错误，传递给调用者
    }
  }

  // 删除键
  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (err) {
      const error = err as Error;
      this.logger.error(
        `Failed to delete key ${key}: ${error.message}`,
        error.stack,
      );
      throw error; // 可以抛出错误，传递给调用者
    }
  }
  // 获取键的剩余生存时间（秒）
  async ttl(key: string): Promise<number> {
    try {
      const ttl = await this.client.ttl(key);
      if (ttl < 0) {
        this.logger.warn(`Key ${key} has no expiration (ttl: ${ttl}).`);
      }
      return ttl;
    } catch (err) {
      const error = err as Error;
      this.logger.error(
        `Failed to get TTL for key ${key}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
  // 关闭连接
  async quit(): Promise<void> {
    try {
      await this.client.quit();
      this.logger.log('Redis connection closed successfully');
    } catch (err) {
      const error = err as Error;
      this.logger.error('Failed to close Redis connection', error.stack);
      throw error; // 可以抛出错误，传递给调用者
    }
  }
}

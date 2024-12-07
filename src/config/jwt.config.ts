import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET, // 从环境变量读取 JWT secret 或使用默认值
  expiresIn: process.env.JWT_EXPIRATION_TIME, // 从环境变量读取过期时间或使用默认值
}));

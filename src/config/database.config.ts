import * as path from 'path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export default function databaseConfig(
  configService: ConfigService,
): TypeOrmModuleOptions {
  const isProduction = process.env.NODE_ENV === 'production'; // 判断是否是生产环境

  // 根据环境选择文件路径
  const entitiesPath = isProduction
    ? path.join(__dirname, '/../**/*.entity{.ts,.js}') // 生产环境：dist 中的 .js 文件
    : path.join(__dirname, '/../**/*.entity{.ts,.js}'); // 开发环境：src 中的 .ts 文件

  //   console.log('Entities path:', entitiesPath); // 输出路径，帮助调试

  return {
    type: 'mysql',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    entities: [entitiesPath], // 确保实体路径正确
    synchronize: true, // 开发环境可以设置为 true，生产环境设置为 false
    logging: false, // 开启 SQL 查询日志
  };
}

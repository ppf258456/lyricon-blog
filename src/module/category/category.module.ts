import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category])], // 引入Category实体
  providers: [CategoryService], // 提供Category服务
  controllers: [CategoryController], // 控制Category的控制器
})
export class CategoryModule {}

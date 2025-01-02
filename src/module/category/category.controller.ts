import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from 'src/guards/JwtAuth.guard ';
import { AdminGuard } from 'src/guards/Admin.guard';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard) // 使用 JwtAuthGuard 和 AdminGuard 来保护接口
  create(@Body(new ValidationPipe()) createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id, {
      relations: ['parentCategory', 'children'],
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard) // 使用 JwtAuthGuard 和 AdminGuard 来保护接口
  update(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard) // 使用 JwtAuthGuard 和 AdminGuard 来保护接口
  remove(@Param('id') id: number) {
    return this.categoryService.remove(id);
  }
}

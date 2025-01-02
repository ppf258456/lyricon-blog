import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // 限定只处理article类型的分类创建
    if (createCategoryDto.type !== 'article') {
      throw new ConflictException('当前只支持创建article类型的分类');
    }

    // 如果parentCategoryId为空，表示创建根分类，不需要校验父分类是否存在
    if (!createCategoryDto.parentCategoryId) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: createCategoryDto.name },
      });
      if (existingCategory) {
        throw new ConflictException('该分类已存在！！！！');
      }

      const category = this.categoryRepository.create(createCategoryDto);
      return await this.categoryRepository.save(category);
    }

    const existingCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('该分类已存在！！！！');
    }

    const category = this.categoryRepository.create(createCategoryDto);

    const parentCategory = await this.categoryRepository.findOne({
      where: { id: category.parentCategoryId },
    });
    if (!parentCategory) {
      throw new ConflictException(
        '指定的父分类不存在，请确认parentCategoryId的值',
      );
    }

    return await this.categoryRepository.save(category);
  }

  private async findCategoryById(
    id: number,
    options?: FindOneOptions<Category>,
  ): Promise<Category> {
    const findOptions: FindOneOptions<Category> = {
      relations: ['parentCategory', 'children'],
      ...options,
    };

    return await this.categoryRepository.findOneOrFail({
      where: { id },
      ...findOptions,
    });
  }

  // 查找所有分类，包括嵌套的父子关系
  async findAll(): Promise<Category[]> {
    const categories = await this.categoryRepository.find({
      relations: ['parentCategory'],
      order: {
        nsleft: 'ASC', // 按照 nsleft 值排序
      },
    });

    return this.buildCategoryTree(categories);
  }

  async findOne(
    id: number,
    options?: FindOneOptions<Category>,
  ): Promise<Category> {
    const category = await this.findCategoryById(id, options);

    if (category.parentCategory) {
      category.parentCategory = await this.findCategoryById(
        category.parentCategory.id,
      );
    }

    return category;
  }
  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    Object.assign(category, updateCategoryDto);

    return await this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    category.deletedAt = new Date();
    await this.categoryRepository.save(category);
  }

  private buildCategoryTree(categories: Category[]): Category[] {
    const categoryMap = new Map<number, Category>();
    const processedIds = new Set<number>();

    categories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    const categoryTree: Category[] = [];

    categories.forEach((category) => {
      if (category.parentCategoryId) {
        const parentCategory = categoryMap.get(category.parentCategoryId);
        if (parentCategory && !processedIds.has(category.id)) {
          parentCategory.children.push(categoryMap.get(category.id)!);
          processedIds.add(category.id);
        }
      } else {
        categoryTree.push(categoryMap.get(category.id)!);
      }
    });

    return categoryTree;
  }
}

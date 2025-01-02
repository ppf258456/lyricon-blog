import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: '分类名称不能为空' })
  name: string;

  @IsNotEmpty()
  type: 'article'; // 可以根据实际情况调整

  @IsOptional()
  parentCategoryId?: number; // 允许为空

  @IsOptional()
  nsleft: number;

  @IsOptional()
  nsright: number;
}

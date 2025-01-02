import { IsOptional } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  type?: 'article';

  @IsOptional()
  parentCategoryId?: number;

  @IsOptional()
  nsleft?: number;

  @IsOptional()
  nsright?: number;

  @IsOptional()
  deletedAt?: Date;
}

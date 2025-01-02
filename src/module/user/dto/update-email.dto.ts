// update-email.dto.ts
import { IsEmail, IsString } from 'class-validator';

export class UpdateEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string; // 用户当前密码用于验证
}

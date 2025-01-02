import { IsString, IsEmail, ValidateIf } from 'class-validator';
import { IsValidPassword } from '../../../decorators/custom-validation.decorator';

export class LoginDto {
  @IsEmail()
  @ValidateIf((o) => !o.uid) // 如果未提供 uid，则验证邮箱
  email?: string;

  @IsString({ message: 'UID 必须是字符串类型' })
  @ValidateIf((o) => !o.email) // 如果未提供邮箱，则验证 UID
  uid?: string;

  @IsValidPassword({
    message:
      '密码不能包含汉字，只能包含字母、数字和常用的特殊字符，且长度在6到20个字符之间',
  })
  password: string;
}

import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { UserRole, UserLevel } from '../user.entity';
import {
  IsValidUsername,
  IsValidPassword,
} from '../../../decorators/custom-validation.decorator';

export class CreateUserDto {
  @IsValidUsername({
    message:
      '用户名只能包含字母、数字、下划线、连字符或汉字，长度在3到20个字符之间',
  })
  username: string;

  @IsEmail()
  email: string;

  @IsString() // UID
  uid: string;

  @IsString({ message: '验证码必须是字符串类型' })
  emailVerificationCode?: string;

  @IsValidPassword({
    message:
      '密码不能包含汉字，只能包含字母、数字和常用的特殊字符，且长度在6到20个字符之间',
  })
  password: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role: UserRole;

  @IsEnum(UserLevel)
  @IsOptional()
  level: UserLevel;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}

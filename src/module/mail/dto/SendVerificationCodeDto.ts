import { IsEmail, IsString } from 'class-validator';

export class SendVerificationCodeDto {
  @IsEmail()
  email: string;
}

export class VerifyCodeDto {
  @IsEmail()
  email: string;

  @IsString()
  emailVerificationCode: string;
}

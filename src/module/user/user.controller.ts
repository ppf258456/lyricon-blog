import {
  Controller,
  Post,
  Body,
  Logger,
  BadRequestException,
  Get,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { DefaultUserValuesService } from './utils/default-user-values.service';
import { validate } from 'class-validator';
import { EmailVerificationService } from './../mail/email-verification.service';
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly defaultUserValuesService: DefaultUserValuesService,

    private readonly EmailVerificationService: EmailVerificationService,
  ) {}

  // 用户注册接口
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    this.logger.log('开始注册用户');
    // 验证验证码
    const { email, emailVerificationCode } = createUserDto;
    if (!emailVerificationCode) {
      throw new BadRequestException('验证码不能为空');
    }

    await this.EmailVerificationService.verifyCode(
      email,
      emailVerificationCode,
    ); // 调用验证码验证方法

    // 使用服务设置默认值
    createUserDto = this.defaultUserValuesService.setDefaults(createUserDto);
    return this.userService.register(createUserDto);
  }

  // 验证用户名是否唯一
  @Post('check-username')
  async checkUsername(
    @Body('username') username: string,
  ): Promise<{ isUnique: boolean }> {
    this.logger.log(`检查用户名: ${username}`);
    const isUnique = await this.userService.isUsernameUnique(username);
    return { isUnique };
  }

  // 验证密码是否符合规范
  @Post('check-password')
  async checkPassword(
    @Body('password') password: string,
  ): Promise<{ isValid: boolean; message?: string }> {
    this.logger.log('检查密码是否符合规范');

    // 使用 Object.assign 给 CreateUserDto 实例赋值
    const createUserDto = new CreateUserDto();
    createUserDto.password = password;

    const validationErrors = await validate(createUserDto);

    if (validationErrors.length > 0) {
      return { isValid: false, message: '密码不符合规范' };
    }

    return { isValid: true };
  }
  // 检查邮箱是否已注册
  @Get('check-email')
  async checkEmail(
    @Query('email') email: string,
  ): Promise<{ isRegistered: boolean }> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const isRegistered = await this.userService.isEmailRegistered(email);
    return { isRegistered };
  }
}

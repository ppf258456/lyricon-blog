import {
  Controller,
  Post,
  Body,
  Logger,
  BadRequestException,
  Get,
  Query,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { DefaultUserValuesService } from './utils/default-user-values.service';
import { validate } from 'class-validator';
import { EmailVerificationService } from './../mail/email-verification.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { JwtAuthGuard } from 'src/guards/JwtAuth.guard ';
import { AdminGuard } from 'src/guards/Admin.guard';
import { plainToInstance } from 'class-transformer';

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

  // 获取所有用户信息
  @Get('list')
  @UseGuards(JwtAuthGuard, AdminGuard) // 使用 JwtAuthGuard 和 AdminGuard 来保护接口
  async getAllUsers() {
    const user = await this.userService.findAll();
    console.log(user);
    // 使用 instanceToPlain 转换用户实体
    const userWithoutPassword = plainToInstance(User, user, {
      excludeExtraneousValues: false, // 排除不需要的字段（如 password）
    });
    console.log(userWithoutPassword);

    this.logger.log(userWithoutPassword);
    // 返回用户的基本信息
    return userWithoutPassword;
  }

  // 获取指定用户信息（仅返回基本信息）
  @Get(':uid')
  async getUserByUid(@Param('uid') uid: string) {
    // 根据 uid 查找用户
    const user = await this.userService.findOneByUid(uid);

    this.logger.log(user);
    if (!user) {
      throw new Error('User not found');
    }

    // 使用 instanceToPlain 转换用户实体
    const userWithoutPassword = plainToInstance(User, user, {
      excludeExtraneousValues: false, // 排除不需要的字段（如 password）
    });
    console.log(userWithoutPassword);

    this.logger.log(userWithoutPassword);
    // 返回用户的基本信息
    return userWithoutPassword;
  }
  // 更新用户基本信息
  @Put(':uid')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('uid') uid: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.userService.update(uid, updateUserDto);
    return '修改成功';
  }
  @Put(':uid/password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Param('uid') uid: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return await this.userService.updatePassword(uid, updatePasswordDto);
  }
  // 修改用户邮箱
  @Put(':uid/email')
  @UseGuards(JwtAuthGuard)
  async updateEmail(
    @Param('uid') uid: string,
    @Body() updateEmailDto: UpdateEmailDto,
  ) {
    return await this.userService.updateEmail(uid, updateEmailDto);
  }
  @Put('delete/:uid')
  @UseGuards(JwtAuthGuard, AdminGuard) // 需要管理员权限
  async softDeleteUser(@Param('uid') uid: string) {
    return await this.userService.softDelete(uid);
  }
}

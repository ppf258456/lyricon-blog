import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserLevel } from '../user.entity';

@Injectable()
export class DefaultUserValuesService {
  constructor(private readonly configService: ConfigService) {}

  getDefaultValues(): Record<string, any> {
    //对于level通过环境变量找到后转换为UserLevel枚举类型
    const level = this.configService.get<UserLevel>('USER_LEVEL');
    const userLevel = UserLevel[level as unknown as keyof typeof UserLevel];
    return {
      avatar: this.configService.get('USER_AVATAR'),
      backgroundImage: this.configService.get('USER_BACKGROUND_IMAGE'),
      bio: this.configService.get('USER_BIO'),
      role: this.configService.get('USER_ROLE'),
      level: userLevel as UserLevel,
      isActive: this.configService.get('USER_IS_ACTIVE') === 'true',
    };
  }

  setDefaults(createUserDto: CreateUserDto): CreateUserDto {
    const defaultValues = this.getDefaultValues();

    createUserDto.avatar = createUserDto.avatar || defaultValues.avatar;
    createUserDto.backgroundImage =
      createUserDto.backgroundImage || defaultValues.backgroundImage;
    createUserDto.bio = createUserDto.bio || defaultValues.bio;
    createUserDto.role = createUserDto.role || defaultValues.role;
    createUserDto.level = createUserDto.level || defaultValues.level;
    createUserDto.isActive =
      createUserDto.isActive !== undefined
        ? createUserDto.isActive
        : defaultValues.isActive;

    return createUserDto;
  }
}

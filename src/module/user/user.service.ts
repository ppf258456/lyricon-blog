import { ConflictException, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UidService } from '../uid/uidService';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly uidService: UidService, // 注入UidService
  ) {}

  // 用户注册方法
  async register(createUserDto: CreateUserDto): Promise<User> {
    return await this.userRepository.manager.transaction(
      async (manager: EntityManager) => {
        const { email, password } = createUserDto;

        const isRegistered = await manager.findOne(User, { where: { email } });
        if (isRegistered) {
          throw new ConflictException('邮箱已注册，请找回密码');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const uid = this.uidService.generateUid();
        createUserDto.uid = uid;

        const user = manager.create(User, {
          ...createUserDto,
          password: hashedPassword,
        });

        return await manager.save(user);
      },
    );
  }

  // 检查用户名是否唯一
  async isUsernameUnique(username: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { username } });
    return !user; // 如果没有找到用户，返回 true，表示用户名唯一
  }
  // 检查邮箱是否已注册
  async isEmailRegistered(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    return !!user;
  }

  // 根据邮箱查找用户
  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { email },
    });
  }
  // 根据 uid 查找用户
  async findOneByUid(uid: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { uid } });
  }
  async save(user: User): Promise<User> {
    return this.userRepository.save(user); // 调用 save 方法保存用户
  }

  // 更新用户设备信息
  async updateDeviceInfo(user: User, deviceInfo: string): Promise<void> {
    if (!user.devices) user.devices = [];
    if (!user.devices.includes(deviceInfo)) {
      user.devices.push(deviceInfo);
      await this.userRepository.save(user);
    }
  }

  // 检查设备是否已达到最大登录数
  async checkMaxDevices(user: User): Promise<boolean> {
    if (user.devices && user.devices.length >= 5) {
      return true;
    }
    return false;
  }
}

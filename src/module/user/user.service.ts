import { ConflictException, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UidService } from '../uid/uidService';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { Cron } from '@nestjs/schedule';
import { DataCleanupService } from './data-cleanup.service'; // 引入DataCleanupService

@Injectable()
export class UserService {
  @Cron('0 0 * * *') // 每天午夜执行
  async handleHardDelete() {
    await this.hardDelete();
    console.log('已清理超过14天的删除用户');
  }

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly uidService: UidService, // 注入UidService
    private readonly dataCleanupService: DataCleanupService, // 注入DataCleanupService
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

        const user = manager.create(User, {
          ...createUserDto,
          password: hashedPassword,
          uid,
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
    console.log('Entering findOneByUid method with uid: ', uid);
    try {
      const user = await this.userRepository.findOne({ where: { uid } });
      // console.log(user);
      return user;
    } catch (error) {
      console.error('Error occurred while finding user by uid: ', error);
      throw error; // 可以选择根据具体情况进行合适的错误包装后再抛出
    }
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
  // 获取所有用户
  async findAll(): Promise<User[]> {
    console.log('Entering findAll method');
    const user = await this.userRepository.find({ where: { deletedAt: null } }); // 排除已软删除的用户
    // console.log(user);

    return user;
  }

  // 更新用户基本信息
  async update(uid: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { uid } });
    if (!user) {
      throw new Error('User not found');
    }

    // 更新用户字段
    Object.assign(user, updateUserDto);
    user.updatedAt = new Date(); // 更新修改时间
    return this.userRepository.save(user);
  }

  // 修改用户密码
  async updatePassword(
    uid: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<User> {
    const { oldPassword, newPassword } = updatePasswordDto;
    const user = await this.userRepository.findOne({ where: { uid } });

    if (!user) {
      throw new Error('User not found');
    }

    // 验证旧密码是否正确
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Old password is incorrect');
    }

    // 加密新密码并更新
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.updatedAt = new Date(); // 更新修改时间
    return this.userRepository.save(user);
  }
  // 修改用户邮箱
  async updateEmail(
    uid: string,
    updateEmailDto: UpdateEmailDto,
  ): Promise<User> {
    const { email, password } = updateEmailDto;
    const user = await this.userRepository.findOne({ where: { uid } });

    if (!user) {
      throw new Error('User not found');
    }

    // 验证密码是否正确
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // 检查新邮箱是否已注册
    const isEmailTaken = await this.userRepository.findOne({
      where: { email },
    });
    if (isEmailTaken) {
      throw new Error('Email is already taken');
    }

    // 更新邮箱
    user.email = email;
    user.updatedAt = new Date(); // 更新修改时间
    return this.userRepository.save(user);
  }

  // 软删除用户
  async softDelete(uid: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { uid } });
    if (!user) {
      throw new Error('User not found');
    }

    user.deletedAt = new Date(); // 设置删除时间
    await this.userRepository.save(user); // 保存用户的删除状态
    return '用户已删除';
  }
  // 物理删除用户
  async hardDelete(): Promise<void> {
    await this.dataCleanupService.physicalDeleteOldDeletedUsers();
    console.log('物理删除已标记超过14天的删除用户');
  }
}

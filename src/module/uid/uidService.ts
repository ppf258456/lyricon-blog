import { Injectable } from '@nestjs/common';

@Injectable()
export class UidService {
  // 生成唯一的纯数字ID，存储为字符串
  generateUid(): string {
    const timestamp = Date.now(); // 获取当前时间戳（毫秒）
    const random = Math.floor(Math.random() * 1000000); // 生成一个随机数，用来增加随机性
    const uid = `${timestamp}${random}`;
    console.log('uid:', typeof uid);

    return uid; // 将时间戳和随机数拼接
  }
}

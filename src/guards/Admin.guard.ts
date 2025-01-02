import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../module/user/user.entity'; // 引用 UserRole 枚举

@Injectable()
export class AdminGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // 从请求中获取到的用户信息

    // 判断用户是否为管理员
    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('您无权访问该资源！！');
    }

    return true; // 如果是管理员，返回 true，允许访问
  }
}

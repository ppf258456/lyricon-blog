import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // 这里我们可以重写一些方法，来进行更细致的控制
  canActivate(context: any): boolean {
    // 1. 调用父类的 canActivate 方法来进行验证
    // 2. 如果要做一些额外的验证可以在这里进行
    return super.canActivate(context) as boolean;
  }

  handleRequest(err: any, user: any) {
    // 这里我们可以处理用户信息、错误或者自定义异常
    if (err || !user) {
      throw err || new Error('Unauthorized');
    }
    return user;
  }
}

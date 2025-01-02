import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        code: 200, // 设置统一的状态码
        message: 'OK', // 统一的消息
        data: data, // 业务数据
      })),
      catchError((error) => {
        let code: number;
        let message: string;

        // 判断异常类型
        if (error instanceof UnauthorizedException) {
          code = HttpStatus.UNAUTHORIZED;
          message = '无权访问，权限不足！';
        } else if (error instanceof NotFoundException) {
          code = HttpStatus.NOT_FOUND;
          message = '资源未找到！';
        } else if (error instanceof InternalServerErrorException) {
          code = HttpStatus.INTERNAL_SERVER_ERROR;
          message = '服务器内部错误，请稍后重试。';
        } else if (error instanceof BadRequestException) {
          code = HttpStatus.BAD_REQUEST;
          message = '请求参数错误或无效。';
        } else {
          code = HttpStatus.INTERNAL_SERVER_ERROR;
          message = '未知错误';
        }

        return throwError(() => new HttpException({ code, message }, code));
      }),
    );
  }
}

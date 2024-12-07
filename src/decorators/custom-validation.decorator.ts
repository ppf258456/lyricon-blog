// src/decorators/custom-validation.decorator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * 验证用户名是否合法，允许字母、数字、下划线、连字符和汉字，长度在3到20个字符之间
 */
export function IsValidUsername(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidUsername',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate(value: any, _args: ValidationArguments) {
          // 前缀为 '_args' 表示未使用
          const regex = /^[a-zA-Z0-9_\-\u4e00-\u9fa5]{3,20}$/;
          return typeof value === 'string' && regex.test(value);
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        defaultMessage(_args: ValidationArguments) {
          return '用户名只能包含字母、数字、下划线、连字符或汉字，长度在3到20个字符之间';
        },
      },
    });
  };
}

/**
 * 验证密码是否合法，不包含汉字，包含字母、数字和常用的特殊字符，长度在6到20个字符之间
 */
export function IsValidPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate(value: any, _args: ValidationArguments) {
          // 前缀为 '_args' 表示未使用
          const regex =
            /^(?!.*[\u4e00-\u9fa5])[A-Za-z0-9!@#$%^&*(),.?":{}|<>]{6,20}$/;
          return typeof value === 'string' && regex.test(value);
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        defaultMessage(_args: ValidationArguments) {
          return '密码不能包含汉字，只能包含字母、数字和常用的特殊字符，且长度在6到20个字符之间';
        },
      },
    });
  };
}

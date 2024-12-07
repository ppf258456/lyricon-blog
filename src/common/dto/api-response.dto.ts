// src/common/dto/api-response.dto.ts
export class ApiResponse<T> {
  message: string; // 消息
  data?: T; // 返回的数据（可选）
  code?: number; // 状态码（可选）
}

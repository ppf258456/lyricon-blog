export interface JwtPayload {
  uid: string; // 用户的唯一标识符，来自数据库中的 uid
  email: string; // 用户的邮箱
}

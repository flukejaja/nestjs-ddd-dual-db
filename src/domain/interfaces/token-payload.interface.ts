export interface TokenPayload {
  sub: string; // subject (usually user id)
  username: string;
  iat?: number; // issued at
  exp?: number; // expiration time
}

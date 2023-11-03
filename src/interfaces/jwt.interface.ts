import jwt from 'jsonwebtoken';

export interface IJwtVerifyResponse {
  valid: boolean;
  expired: boolean;
  decode: string | jwt.JwtPayload;
}

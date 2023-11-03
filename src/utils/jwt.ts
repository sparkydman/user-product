import * as jwt from 'jsonwebtoken';
import { IJwtVerifyResponse } from 'src/interfaces/jwt.interface';

export class JwtHandler {
  constructor(private readonly privateKey: string) {}
  genToken(payload: string | object, options?: jwt.SignOptions): string {
    return jwt.sign(payload, this.privateKey, {
      ...options,
      algorithm: 'RS256',
    });
  }
  verifyToken(token: string): IJwtVerifyResponse {
    try {
      const verify = jwt.verify(token, this.privateKey);
      return { valid: true, expired: false, decode: verify };
    } catch (e: any) {
      console.error(e);
      return {
        valid: false,
        expired: e.message === 'jwt expired',
        decode: null,
      };
    }
  }
}

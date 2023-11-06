import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  SetMetadata,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtHandler } from '../utils/jwt';
import * as config from 'config';
import { Reflector } from '@nestjs/core';
import { UserService } from '../user/user.service';

export const NO_AUTH_KEY = 'no_auth';
export const Public = () => SetMetadata(NO_AUTH_KEY, true);

@Injectable()
export class AuthRequired implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(NO_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer') {
      throw new UnauthorizedException();
    }
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const handler = new JwtHandler(config.get<string>('private_key'));
      const result: any = await handler.verifyToken(token);
      const user = result.decode?.user;
      const session = await this.userService.getUserSession(user.id);
      if (!session.isActive) {
        throw new UnauthorizedException();
      }
      request['user'] = user;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}

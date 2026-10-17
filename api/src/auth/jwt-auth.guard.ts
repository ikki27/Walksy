import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

import { ApiError } from '../common/api-error';
import type { AuthUser } from './current-user.decorator';
import { IS_PUBLIC_KEY } from './public.decorator';

export type TokenPayload = { sub: string };

// Runs before every request (registered globally in AuthModule).
// Checks the "Authorization: Bearer <token>" header and remembers who the user is.
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) throw new ApiError('unauthorized', HttpStatus.UNAUTHORIZED);

    try {
      const payload = await this.jwt.verifyAsync<TokenPayload>(token);
      request.user = { id: payload.sub };
      return true;
    } catch {
      // expired or tampered token: the app logs the person out
      throw new ApiError('unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}

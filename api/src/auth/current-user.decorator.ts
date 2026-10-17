import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// who is making the request, set by JwtAuthGuard
export type AuthUser = { id: string };

// usage in a controller: method(@CurrentUser() user: AuthUser)
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): AuthUser => {
  return context.switchToHttp().getRequest<{ user: AuthUser }>().user;
});

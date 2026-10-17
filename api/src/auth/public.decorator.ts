import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// every endpoint needs a login, except the ones marked @Public() (register, login)
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

// a short or empty secret would make login tokens easy to forge
const MIN_JWT_SECRET_LENGTH = 32;
const DEFAULT_JWT_EXPIRES_IN = '30d';
// a number WITH a unit: "30d", "12h", "45m", "3600s". A bare "30" would mean 30 milliseconds,
// so every token would already be expired when the app uses it.
const JWT_EXPIRES_IN_FORMAT = /^[1-9]\d*(s|m|h|d)$/;

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET')?.trim() ?? '';
        // stop at startup (visible in the deploy log) instead of failing on the first login
        if (secret.length < MIN_JWT_SECRET_LENGTH) {
          throw new Error(`JWT_SECRET is missing or shorter than ${MIN_JWT_SECRET_LENGTH} characters`);
        }

        const expiresIn = config.get<string>('JWT_EXPIRES_IN')?.trim() || DEFAULT_JWT_EXPIRES_IN;
        if (!JWT_EXPIRES_IN_FORMAT.test(expiresIn)) {
          throw new Error(`JWT_EXPIRES_IN "${expiresIn}" is invalid: use a number with a unit, e.g. 30d, 12h, 45m`);
        }

        return { secret, signOptions: { expiresIn: expiresIn as StringValue } };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // secure by default: every route needs a valid token unless marked @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AuthModule {}

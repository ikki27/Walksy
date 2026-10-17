import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { ApiError } from '../common/api-error';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toPublicUser } from '../users/user.mapper';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import type { TokenPayload } from './jwt-auth.guard';

@Injectable()
export class AuthService {
  // hash of a random password: lets a login with an unknown email take as long as a real one,
  // so nobody can find out which emails have an account by timing the answer
  private readonly dummyHash = argon2.hash(crypto.randomUUID());

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: await argon2.hash(dto.password),
          firstName: dto.firstName,
          lastName: dto.lastName,
          userType: dto.userType,
          language: dto.language ?? 'en',
          termsAcceptedAt: new Date(),
        },
      });
      return this.session(user);
    } catch (error) {
      // P2002 = unique constraint failed: this email is already registered
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ApiError('email_taken', HttpStatus.CONFLICT);
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    const valid = await argon2.verify(user?.passwordHash ?? (await this.dummyHash), dto.password);

    // same answer for "no such email" and "wrong password"
    if (!user || !valid) throw new ApiError('invalid_credentials', HttpStatus.UNAUTHORIZED);
    return this.session(user);
  }

  private async session(user: Parameters<typeof toPublicUser>[0]) {
    const payload: TokenPayload = { sub: user.id };
    return { token: await this.jwt.signAsync(payload), user: toPublicUser(user) };
  }
}

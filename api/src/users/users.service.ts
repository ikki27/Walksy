import { HttpStatus, Injectable } from '@nestjs/common';

import { ApiError } from '../common/api-error';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    // the account was deleted while the token was still valid
    if (!user) throw new ApiError('unauthorized', HttpStatus.UNAUTHORIZED);
    return user;
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.getById(id);
    const data: Prisma.UserUpdateInput = {
      language: dto.language,
      companionName: dto.companionName,
    };

    if (dto.healthDataConsent === false) {
      // consent withdrawn: the health data has to go too
      data.healthDataConsentAt = null;
      data.accessibilityNeeds = [];
    } else {
      const consentGiven = dto.healthDataConsent === true || user.healthDataConsentAt !== null;
      if (dto.healthDataConsent === true && !user.healthDataConsentAt) data.healthDataConsentAt = new Date();

      if (dto.accessibilityNeeds) {
        const needs = [...new Set(dto.accessibilityNeeds)];
        const isHealthData = needs.some((need) => need !== 'none');
        if (isHealthData && !consentGiven) throw new ApiError('consent_required', HttpStatus.BAD_REQUEST);
        data.accessibilityNeeds = needs;
      }
    }

    return this.prisma.user.update({ where: { id }, data });
  }
}

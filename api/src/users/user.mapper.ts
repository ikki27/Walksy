import type { User } from '../generated/prisma/client';

// what the app may see about a user: never the password hash
export type PublicUser = ReturnType<typeof toPublicUser>;

export function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    userType: user.userType,
    language: user.language,
    companionName: user.companionName,
    accessibilityNeeds: user.accessibilityNeeds,
    healthDataConsent: user.healthDataConsentAt !== null,
    createdAt: user.createdAt.toISOString(),
  };
}

// keep in sync with the backend (prisma/schema.prisma + users/user.mapper.ts)
export type UserType = 'regular' | 'institution' | 'volunteer';

export type AccessibilityNeed =
  | 'deafness'
  | 'speech'
  | 'visual'
  | 'mobility'
  | 'autism'
  | 'adhd'
  | 'elderly'
  | 'none';

// the logged-in user, as the backend sends it (never the password)
export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  language: string;
  companionName: string;
  accessibilityNeeds: AccessibilityNeed[];
  healthDataConsent: boolean;
  createdAt: string;
};

// filled in on the personalize screen
export type Personalization = {
  companionName: string;
  accessibilityNeeds: AccessibilityNeed[];
  // GDPR consent to store accessibility needs (health data)
  healthDataConsent: boolean;
};

export type SignUpData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: UserType;
};

export type ProfileUpdate = Partial<Personalization> & { language?: string };

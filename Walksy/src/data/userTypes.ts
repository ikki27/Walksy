import type { UserType } from '../types/account';

// labelKey points to the translation in src/i18n/locales
export const USER_TYPES: { value: UserType; labelKey: string }[] = [
  { value: 'regular', labelKey: 'userTypes.regular' },
  { value: 'institution', labelKey: 'userTypes.institution' },
  { value: 'volunteer', labelKey: 'userTypes.volunteer' },
];
